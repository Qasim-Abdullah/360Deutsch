import * as THREE from "three";
import { startTransition } from "./TransitionManager";
import { ViewRegistry } from "./ViewRegistry";
import { createDynamicEdge } from "./EdgeFactory";
import { createBackButton } from "../buttons/BackButton";

type ViewState = {
    view: string;
    context: any;
};

export class XRViewManager {
    private scene: THREE.Scene;

    private currentView: string = "levels";
    private currentContext: any = {};
    private history: ViewState[] = [];

    private currentAnchor: THREE.Object3D | null = null;
    private currentChildren: THREE.Object3D[] = [];
    private currentEdges: THREE.Object3D[] = [];

    private backButton: THREE.Object3D | null = null;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    init() {
        this.loadView("levels");
    }


    // -------------------------
    // PUBLIC NAVIGATION
    // -------------------------

    navigate(viewName: string, context: any = {}) {
        if (this.currentView) {
            this.history.push({
                view: this.currentView,
                context: this.currentContext
            });
        }

        this.loadView(viewName, context);
    }

    setRoot(viewName: string, context: any = {}) {
        this.history = [];
        this.loadView(viewName, context);
    }

    goBack() {
        const previous = this.history.pop();
        if (!previous) return;

        this.loadView(previous.view, previous.context);
    }

    // -------------------------
    // INTERNAL LOADER
    // -------------------------

    private loadView(viewName: string, context: any = {}) {
        const view = ViewRegistry[viewName];
        if (!view) return;

        const nextAnchor = context.anchor;

        // hiding OLD ANCHOR but not removing it
        if (this.currentAnchor && this.currentAnchor !== nextAnchor) {
            this.currentAnchor.visible = false;
        }

        // remove old children
        this.currentChildren.forEach(o => {
            if (o !== nextAnchor) {
                this.scene.remove(o);
            }
        });

        // remove edges
        this.currentEdges.forEach(o => this.scene.remove(o));

        // remove back button
        if (this.backButton) {
            this.scene.remove(this.backButton);
            this.backButton = null;
        }

        this.currentChildren = [];
        this.currentEdges = [];

        // build new view
        const result = view.build(this.scene, context, {
            goTo: (v: string, ctx: any) => {
                if (v === "back") {
                    this.goBack();
                } else {
                    this.navigate(v, ctx);
                }
            },
            createEdge: (from, to) =>
                createDynamicEdge(this.scene, from, to)
        });

        this.currentView = viewName;
        this.currentContext = context;

        this.currentAnchor = result.anchor || null;

        if (this.currentAnchor) {
            this.currentAnchor.visible = true;
        }

        this.currentChildren = result.children || [];
        this.currentEdges = result.edges || [];


        // add back button
        if (this.history.length > 0) {
            this.backButton = createBackButton({
                onEnter: () => this.goBack(),
            });

            this.scene.add(this.backButton);
            this.currentChildren.push(this.backButton);
        }

        // fade in
        startTransition({
            duration: 500,
            update: (p) => {
                this.currentChildren.forEach(obj => {
                    obj.traverse(o => {
                        const m = (o as any).material;
                        if (m?.opacity !== undefined) {
                            m.transparent = true;
                            m.opacity = p;
                        }
                    });
                });

                this.currentEdges.forEach(edge => {
                    const m = (edge as any).material;
                    if (m) m.opacity = p * 0.7;
                });
            }
        });
    }


}
