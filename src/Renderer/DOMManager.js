
export class DOMManager {
    static init(container, config) {
        container.innerHTML = `
            <div id="tree__viewport" style="width:100%; height:100vh; overflow:hidden; position:relative; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
                <div id="config-panel" style="position:absolute; top:0; left:-320px; width:300px; height:100%; background:white; border-right:1px solid #e2e8f0; z-index:150; padding:20px; transition:left 0.3s ease; font-family:sans-serif; box-shadow:4px 0 10px rgba(0,0,0,0.05); overflow-y:auto;">
                    <h3 style="margin-top:0; font-size:16px;">Gradient Settings</h3>
                    <div id="color-controls"></div>
                </div>

                <div id="tree__toolbar" style="position:absolute; top:20px; right:20px; z-index:100; display:flex; flex-direction:column; gap:8px;">
                    <button id="btn-config" title="Settings" style="width:40px; height:40px; border-radius:8px; border:1px solid #cbd5e1; background:white; cursor:pointer;">⚙️</button>
                    <button id="btn-fit" title="Fit to Screen" style="width:40px; height:40px; border-radius:8px; border:1px solid #cbd5e1; background:white; cursor:pointer;">⛶</button>
                    <button id="btn-zoom-in" style="width:40px; height:40px; border-radius:8px; border:1px solid #cbd5e1; background:white; cursor:pointer;">+</button>
                    <button id="btn-zoom-out" style="width:40px; height:40px; border-radius:8px; border:1px solid #cbd5e1; background:white; cursor:pointer;">−</button>
                </div>

                <div id="tree__content-holder" style="position:absolute; transform-origin: 0 0;">
                    <svg id="tree__svg-container" style="position:absolute; overflow:visible; pointer-events:none;">
                        <g id="tree__path-group"></g>
                    </svg>
                    <div id="tree__nodes-container" style="position:relative;"></div>
                </div>
            </div>`;

        return {
            viewport: container.querySelector('#tree__viewport'),
            holder: container.querySelector('#tree__content-holder'),
            pathGroup: container.querySelector('#tree__path-group'),
            nodes: container.querySelector('#tree__nodes-container'),
            panel: container.querySelector('#config-panel'),
            colorControls: container.querySelector('#color-controls'),
            btnConfig: container.querySelector('#btn-config'),
            btnFit: container.querySelector('#btn-fit'),
            btnIn: container.querySelector('#btn-zoom-in'),
            btnOut: container.querySelector('#btn-zoom-out')
        };
    }
}