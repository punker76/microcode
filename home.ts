namespace kojac {
    enum HomeView {
        Console,    // Show the console log
        Plot        // Show the plot graph
    };

    const TOOLBAR_HEIGHT = 18;
    const LINE_HEIGHT = 9;
    const CONSOLE_MARGIN = 2;

    export enum LineJustification {
        Left,
        Center,
        Right
    }

    type LogLine = {
        text: string;
        color: number;
        justification: LineJustification;
    };

    export class Home extends Stage {
        currView: HomeView;
        logLines: LogLine[];
        progdef: ProgramDefn;
        prog: Program;

        constructor(app: App) {
            super(app, "home");
            this.currView = HomeView.Console;
            this.logLines = [];
        }

        /**
         * Write a line of text to the console log.
         */
        public log(text: string, color = 1, justification = LineJustification.Left) {
            this.logLines.push({ text, color, justification });
            // trim to last 15 entries
            this.logLines = this.logLines.slice(Math.max(this.logLines.length - 15, 0));
            this.setView(HomeView.Console);
        }

        /**
         * Plot a point on the graph.
         */
        public plot(value: number, color = 5) {
            // TODO

            this.setView(HomeView.Plot);
        }

        startup() {
            super.startup();
            controller.left.onEvent(ControllerButtonEvent.Released, function() {
                this.app.pushStage(new Editor(this.app));
            });
        }

        activate() {
            super.activate();
            scene.setBackgroundColor(15);
            this.logLines = [];
            this.log("  _ . _ _ _ . _ _  _| _", 7, LineJustification.Center); 
            this.log(" ||||(_| (_).(_(_)(_|(-", 7, LineJustification.Center); 
            this.log("");
            this.log(" Welcome to micro:code!", 7, LineJustification.Center);
            this.log("");
            this.log("");
            this.progdef = this.app.load(SAVESLOT_AUTO);
            if (!this.progdef) {
                this.progdef = new ProgramDefn();
                this.app.save(SAVESLOT_AUTO, this.progdef);
            }
            if (this.prog) { this.prog.destroy(); }
            this.prog = new Program(this.progdef);
            this.log("program started");
        }

        deactivate() {
            if (this.prog) { this.prog.destroy(); }
            this.prog = undefined;
            this.progdef = undefined;
        }

        update(dt: number) {
            super.update(dt);
            this.prog.execute();
        }

        private setView(view: HomeView) {
            this.currView = view;
        }

        __draw(camera: scene.Camera) {
            this.drawToolbar();
            if (this.currView === HomeView.Console) {
                this.drawConsoleView();
            } else if (this.currView === HomeView.Plot) {
                this.drawPlotView();
            }
        }

        private drawToolbar() {
            // TODO this could all be prerendered/precalculated
            const toolbarTop = scene.screenHeight() - TOOLBAR_HEIGHT;
            screen.fillRect(0, toolbarTop, scene.screenWidth(), TOOLBAR_HEIGHT, 11);
            const icn_dpad_left = icons.get("dpad_left");
            const dpadTop = toolbarTop + (TOOLBAR_HEIGHT >> 1) - (icn_dpad_left.height >> 1);
            screen.print("Press   to edit your code", 2, dpadTop + (LINE_HEIGHT >> 1));
            screen.drawTransparentImage(icn_dpad_left, 32, dpadTop);
        }

        private drawConsoleView() {
            let y = scene.screenHeight() - TOOLBAR_HEIGHT - LINE_HEIGHT;
            for (let i = this.logLines.length - 1; i >= 0; --i) {
                const line = this.logLines[i];
                switch (line.justification) {
                    case LineJustification.Left: {
                        const x = CONSOLE_MARGIN;
                        screen.print(line.text, x, y, line.color, image.font8);
                        break;
                    }
                    case LineJustification.Center: {
                        const x = ((scene.screenWidth() - line.text.length * image.font8.charWidth) >> 1) - (image.font8.charWidth);
                        screen.print(line.text, x, y, line.color, image.font8);
                        break;
                    }
                    case LineJustification.Right: {
                        const x = scene.screenWidth() - CONSOLE_MARGIN - (line.text.length * image.font8.charWidth);
                        screen.print(line.text, x, y, line.color, image.font8);
                        break;
                    }
                }
                y -= LINE_HEIGHT;
            }
        }

        private drawPlotView() {
            // TODO
        }
    }
}
