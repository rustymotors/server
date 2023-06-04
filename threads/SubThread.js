import EventEmitter from "node:events";


export class SubThread extends EventEmitter {
    /**
     *
     * @param {string} name
     * @param {number} [loopInterval=100]
     */
    constructor(name, loopInterval = 100) {
        super();
        this.name = name;
        this.loopInterval = loopInterval;
        this.init();
    }
    
    init() {
        console.log(`${this.name} SubThread() initialized.`);
        this.on("shutdown", this.shutdown.bind(this));
        this.timer = setInterval(this.run.bind(this), this.loopInterval);
    }

    run() {
        // console.log(`${this.name} SubThread() running.`);        
    }
    
    shutdown() {        
        console.log(`${this.name} SubThread() shutting down.`);
        clearInterval(this.timer);
        this.emit("shutdownComplete");
    }   
}
