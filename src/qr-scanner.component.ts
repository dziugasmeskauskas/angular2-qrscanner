import {
    AfterViewInit,
    Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output,
    ViewChild, Renderer2
} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {QRCode} from './lib/qr-decoder/qrcode';

@Component({
    selector: 'qr-scanner',
    styles: [
        ':host video {height: auto; width: 100%;}',
        ':host .mirrored { transform: rotateY(180deg); -webkit-transform:rotateY(180deg); -moz-transform:rotateY(180deg); }',
        ':host {}'
    ],
    template: `
        <ng-container [ngSwitch]="isCanvasSupported">
            <ng-container *ngSwitchDefault>
                <canvas #qrCanvas hidden="true" [width]="canvasWidth" [height]="canvasHeight"></canvas>
                <div #videoWrapper [style.width]="canvasWidth" [style.height]="canvasHeight"></div>
            </ng-container>
            <ng-container *ngSwitchCase="false">
                <p>
                    You are using an <strong>outdated</strong> browser.
                    Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.
                </p>
            </ng-container>
        </ng-container>`
})
export class QrScannerComponent implements OnInit, OnDestroy, AfterViewInit {

    @Input() canvasWidth = 640;
    @Input() canvasHeight = 480;
    @Input() debug = false;
    @Input() stopAfterScan = true;
    @Input() updateTime = 500;

    @Output() capturedQr: EventEmitter<string> = new EventEmitter();
    @Output() foundCameras: EventEmitter<MediaDeviceInfo[]> = new EventEmitter();

    @ViewChild('videoWrapper') videoWrapper: ElementRef;
    @ViewChild('qrCanvas') qrCanvas: ElementRef;

    @Input() chooseCamera: Subject<MediaDeviceInfo> = new Subject();

    private chooseCamera$: Subscription;

    public gCtx: CanvasRenderingContext2D;
    public videoElement: HTMLVideoElement;
    public qrCode: QRCode;
    public stream: MediaStream;
    public captureTimeout: any;

    get isCanvasSupported(): boolean {
        const canvas = this.renderer.createElement('canvas');
        return !!(canvas.getContext && canvas.getContext('2d'));
    }

    constructor(private renderer: Renderer2) {
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.chooseCamera$.unsubscribe();
        this.stopScanning();
    }

    ngAfterViewInit() {
        if (this.debug) console.log('[QrScanner] ViewInit, isSupported: ', this.isCanvasSupported);
        if (this.isCanvasSupported) {
            this.gCtx = this.qrCanvas.nativeElement.getContext('2d');
            this.gCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            this.qrCode = new QRCode();
            if (this.debug) this.qrCode.debug = true;
            this.qrCode.myCallback = (decoded: string) => this.QrDecodeCallback(decoded);
        }
        this.chooseCamera$ = this.chooseCamera.subscribe((camera: MediaDeviceInfo) => this.useDevice(camera));
        this.getMediaDevices().then(devices => this.foundCameras.next(devices));
    }

    startScanning(device: MediaDeviceInfo) {
        this.useDevice(device);
    }

    stopScanning() {

        if (this.captureTimeout) {
            clearTimeout(this.captureTimeout);
            this.captureTimeout = 0;
        }

        const stream = this.stream && this.stream.getTracks().length && this.stream;
        if (stream) {
            stream.getTracks().forEach(track => track.enabled && track.stop())
            this.stream = null;
        }
    }

    getMediaDevices(): Promise<MediaDeviceInfo[]> {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return Promise.resolve([]);
        return navigator.mediaDevices.enumerateDevices()
            .then((devices: MediaDeviceInfo[]) => devices)
            .catch((error: any): any[] => {
                if (this.debug) console.warn('Error', error);
                return [];
            });
    }

    public QrDecodeCallback(decoded: string) {
        this.capturedQr.next(decoded);
        if (this.stopAfterScan) {
            clearTimeout(this.captureTimeout);
            this.captureTimeout = 0;
        } else {
            this.captureTimeout = setTimeout(() => this.captureToCanvas(), this.updateTime);
        }
    }

    private captureToCanvas() {
        try {
            this.gCtx.drawImage(this.videoElement, 0, 0, this.canvasWidth, this.canvasHeight);
            this.qrCode.decode(this.qrCanvas.nativeElement);
        } catch (e) {
            if (this.debug) console.log('[QrScanner] Thrown', e);
            if (!this.stream) return;
            this.captureTimeout = setTimeout(() => this.captureToCanvas(), this.updateTime);
        }
    }

    private setStream(stream: any) {
        this.stream = stream;
        this.videoElement.srcObject = stream;
        this.captureTimeout = setTimeout(() => this.captureToCanvas(), this.updateTime);
    }

    private useDevice(_device: MediaDeviceInfo) {
        const _navigator: any = navigator;

        if (this.captureTimeout) {
            this.stopScanning();
        }

        if (!this.videoElement) {
            this.videoElement = this.renderer.createElement('video');
            this.videoElement.setAttribute('autoplay', 'true');
            // Video tag needs to have playsinline property for it to work on ios devices
            this.videoElement.setAttribute('playsinline', 'true');
            this.videoElement.setAttribute('muted', 'true');
            this.renderer.appendChild(this.videoWrapper.nativeElement, this.videoElement);
        }
        const self = this;

        let constraints: MediaStreamConstraints;
        if (_device) {
            // A "hack" to always use rear camera on a device if possible
            constraints = { audio: false, video: { facingMode: {exact: "environment"} } };
        } else {

            constraints = {audio: false, video: true};
        }
        _navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            self.setStream(stream);
        }).catch(function (err) {
            return self.debug && console.warn('Error', err);
        });
    }

}
