declare module "*.worker.ts" {
    class WebpackWorker extends Worker {
        constructor();
    }
    export default WebpackWorker;
}

declare module "*.worker.js" {
    class WebpackWorker extends Worker {
        constructor();
    }
    export default WebpackWorker;
}

declare module "*.lottie" {
    const content: string;
    export default content;
}

declare module 'pdfjs-dist/build/pdf.worker.entry' {
    const content: any;
    export default content;
}

declare module 'pdfjs-dist/legacy/build/pdf.worker.entry' {
    const content: any;
    export default content;
}
