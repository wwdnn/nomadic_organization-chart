/**
 * Core
 * |
 * -- LayoutEngine.js
 * -- Contant.js
 * 
 * Renderer
 * |
 * -- TreeRenderer.js
 * -- UIFactory.js
 * -- DOMManager.js
 * 
 * Interaction
 * |
 * -- InteractionHandler.js
 * -- SideBarManager.js
 * -- TransformManager.js
 * 
 */


import { LayoutEngine } from './Core/layoutEngine.js';
import { TreeRenderer } from './Renderer/TreeRenderer.js';
import { DOMManager } from './Renderer/DOMManager.js';
import { InteractionHandler } from './Interaction/InteractionHandler.js';
import { SidebarManager } from './Interaction/SideBarManager.js';
import { TransformManager } from './Interaction/TransformManager.js';

export default class NomadicChart {
    constructor(containerId, data, config, settings) {
        this.data = data;
        this.config = config;
        this.settings = settings;
        this.elements = DOMManager.init(document.getElementById(containerId), config);

        this.engine = new LayoutEngine(this.config);
        this.renderer = new TreeRenderer(this.elements, this.config, this.settings);
        this.transform = new TransformManager(this.elements);
        
        this.interaction = new InteractionHandler(this.elements, this.transform.state, () => this.transform.updateView());
        this.sidebar = new SidebarManager(this.elements, this.settings, {
            onUpdate: () => this.rebuild(),
            onRefreshUI: () => this.sidebar.populate()
        });

        this._bindEvents();
        this.rebuild();
        
        setTimeout(() => this.transform.fitToScreen(this.data, this.config), 200);
    }

    rebuild() {
        this.engine.calculate(this.data);
        this.elements.levelMaxGapOut = this.engine.levelMaxGapOut
        this.renderer.clear();
        this.renderer.draw(this.data, () => this.rebuild());
    }

    _bindEvents() {
        const { btnFit, btnIn, btnOut, btnConfig, panel } = this.elements;

        btnFit.onclick = () => this.transform.fitToScreen(this.data, this.config);
        btnIn.onclick = () => this.interaction.zoom(1.2, window.innerWidth / 2, window.innerHeight / 2);
        btnOut.onclick = () => this.interaction.zoom(0.8, window.innerWidth / 2, window.innerHeight / 2);
        
        btnConfig.onclick = () => {
            const isOpen = panel.style.left === "0px";
            panel.style.left = isOpen ? "-320px" : "0px";
            if (!isOpen) this.sidebar.populate();
        };

        panel.onmousedown = (e) => this.sidebar.handleMouseDown(e);
        window.addEventListener('mousemove', (e) => this.sidebar.handleMouseMove(e));
        window.addEventListener('mouseup', () => this.sidebar.handleMouseUp());
    }
}































// // ============================================================ DATA ============================================================
// const data = {
//     id: "CEO",
//     subLevel: 0,
//     supports: [
//       { id: "Secretary A" },
//       { id: "Secretary B" },
//       { id: "Secretary C" }
//     ],
//     children: [
//         { 
//             id: "CBDO", 
//             subLevel: 0, 
//             children: [
//                 { id: "Manager A1", subLevel: 1, children: [] },
//                 { id: "Manager A2", subLevel: 1, children: [] }
//             ] 
//         },
//         {
//             id: "VP Accounting", 
//             subLevel: 1, 
//             children: [
//                 { id: "Supervisor A1", subLevel: 1, children: [] },
//                 { id: "Supervisor A2", subLevel: 1, children: [] },
//                 { id: "Staff A2", subLevel: 2, children: [] }
//             ] 
//         },
//         { 
//             id: "VP Technology", 
//             subLevel: 1,
//             supports: [{id: "Secretary"}],
//             children: [
//                 { id: "Manager B1", subLevel: 0, children: [] },
//                 { id: "Staff B1", subLevel: 2, children: [] }
//             ] 
//         },
//         { 
//             id: "VP Operation", 
//             subLevel: 1, 
//             children: [
//                 { id: "Staff C1", subLevel: 2, children: [] } 
//             ] 
//         }
//     ]
// };

// // ============================================ CONFIGURATION ============================================
// const treeConfig = {
//     spacingX: 220,
//     subLevelGap: 20,    
//     cardWidth: 120,     
//     cardHeight: 60,     
//     gapOut: 30,         
//     gapIn: 60,
//     supportOffset: 70   
// };

// let jobLevelSettings = {
//     0: { label: "CEO", type: 'gradient', angle: 90, stops: [{ color: "#1e293b", pos: 0 }, { color: "#334155", pos: 100 }], activeStopIndex: 0 },
//     1: { label: "VP", type: 'gradient', angle: 90, stops: [{ color: "#1d4ed8", pos: 0 }, { color: "#3b82f6", pos: 100 }], activeStopIndex: 0 },
//     2: { label: "Manager", type: 'gradient', angle: 90, stops: [{ color: "#047857", pos: 0 }, { color: "#10b981", pos: 100 }], activeStopIndex: 0 },
//     3: { label: "Supervisor", type: 'gradient', angle: 90, stops: [{ color: "#b45309", pos: 0 }, { color: "#f59e0b", pos: 100 }], activeStopIndex: 0 },
//     4: { label: "Staff", type: 'gradient', angle: 90, stops: [{ color: "#64748b", pos: 0 }, { color: "#94a3b8", pos: 100 }], activeStopIndex: 0 }
// };

// let levelMaxGapOut = {};
// let transformState = { x: 0, y: 0, scale: 1, isDragging: false, startX: 0, startY: 0 };
// let activeDraggingStop = null;

// // ============================================ CORE ALGORITHM ============================================
// function calculateNodePositions(root) {
//     initializeNodes(root, 0);
//     calculateInitialX(root, null, []);
//     checkAllChildrenOnScreen(root);
//     calculateFinalPositions(root, 0);
// }

// function initializeNodes(node, depth) {
//     node.x = -1; node.y = depth; node.mod = 0;
//     // Jika collapsed, jangan proses anak-anaknya agar posisi merapat
//     if (!node._collapsed && node.children) {
//         node.children.forEach(child => initializeNodes(child, depth + 1));
//     }
// }

// function calculateInitialX(node, leftSibling, allPreviousSiblings) {
//     const children = (!node._collapsed && node.children) ? node.children : [];
//     let currentSiblings = [];
//     children.forEach((child, i) => {
//         calculateInitialX(child, children[i - 1] || null, currentSiblings);
//         currentSiblings.push(child);
//     });

//     if (children.length === 0) {
//         node.x = leftSibling ? leftSibling.x + 1 : 0;
//     } else if (children.length === 1) {
//         if (!leftSibling) { node.x = children[0].x; } 
//         else { node.x = leftSibling.x + 1; node.mod = node.x - children[0].x; }
//     } else {
//         const leftChild = children[0]; const rightChild = children[children.length - 1];
//         const mid = (leftChild.x + rightChild.x) / 2;
//         if (!leftSibling) { node.x = mid; } 
//         else { node.x = leftSibling.x + 1; node.mod = node.x - mid; }
//     }
//     if (children.length > 0 && leftSibling) checkForConflicts(node, allPreviousSiblings);
// }

// function checkForConflicts(node, allPreviousSiblings) {
//     const minDistance = 1;
//     let shiftValue = 0;
//     const nodeContour = {};
//     getLeftContour(node, 0, nodeContour);
//     allPreviousSiblings.forEach(sibling => {
//         const siblingContour = {};
//         getRightContour(sibling, 0, siblingContour);
//         Object.keys(nodeContour).forEach(y => {
//             if (siblingContour[y] !== undefined) {
//                 const distance = nodeContour[y] - siblingContour[y];
//                 if (distance + shiftValue < minDistance) shiftValue = minDistance - distance;
//             }
//         });
//         if (shiftValue > 0) { node.x += shiftValue; node.mod += shiftValue; shiftValue = 0; }
//     });
// }

// function getLeftContour(node, modSum, values) {
//     const x = node.x + modSum;
//     values[node.y] = (values[node.y] === undefined) ? x : Math.min(values[node.y], x);
//     if (!node._collapsed && node.children) {
//         node.children.forEach(child => getLeftContour(child, modSum + node.mod, values));
//     }
// }

// function getRightContour(node, modSum, values) {
//     const x = node.x + modSum;
//     values[node.y] = (values[node.y] === undefined) ? x : Math.max(values[node.y], x);
//     if (!node._collapsed && node.children) {
//         node.children.forEach(child => getRightContour(child, modSum + node.mod, values));
//     }
// }

// function checkAllChildrenOnScreen(root) {
//     const nodeContour = {};
//     getLeftContour(root, 0, nodeContour);
//     let shiftAmount = 0;
//     Object.values(nodeContour).forEach(x => { if (x + shiftAmount < 0) shiftAmount = x * -1; });
//     if (shiftAmount > 0) { root.x += shiftAmount; root.mod += shiftAmount; }
// }

// function calculateFinalPositions(node, modSum) {
//     node.x += modSum;
//     if (!node._collapsed && node.children) {
//         node.children.forEach(child => calculateFinalPositions(child, modSum + node.mod));
//     }
// }

// // ============================================ RENDER ENGINE ============================================
// function initTreeContainer(containerId) {
//     const target = document.getElementById(containerId);
//     target.innerHTML = `
//         <div id="tree__viewport" style="width:100%; height:700px; overflow:hidden; position:relative; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
//             <div id="config-panel" style="position:absolute; top:0; left:-320px; width:300px; height:100%; background:white; border-right:1px solid #e2e8f0; z-index:150; padding:20px; transition:left 0.3s ease; font-family:sans-serif; box-shadow:4px 0 10px rgba(0,0,0,0.05); overflow-y:auto;">
//                 <h3 style="margin-top:0; font-size:16px;">Gradient Settings</h3>
//                 <div id="color-controls"></div>
//             </div>

//             <div id="tree__toolbar" style="position:absolute; top:20px; right:20px; z-index:100; display:flex; flex-direction:column; gap:8px;">
//                 <button id="btn-config" title="Settings" style="width:40px; height:40px; border-radius:8px; border:1px solid #cbd5e1; background:white; cursor:pointer;">⚙️</button>
//                 <button id="btn-fit" title="Fit to Screen" style="width:40px; height:40px; border-radius:8px; border:1px solid #cbd5e1; background:white; cursor:pointer;">⛶</button>
//                 <button id="btn-zoom-in" style="width:40px; height:40px; border-radius:8px; border:1px solid #cbd5e1; background:white; cursor:pointer;">+</button>
//                 <button id="btn-zoom-out" style="width:40px; height:40px; border-radius:8px; border:1px solid #cbd5e1; background:white; cursor:pointer;">−</button>
//             </div>

//             <div id="tree__content-holder" style="position:absolute; transform-origin: 0 0; transition: transform 0.4s ease-out;">
//                 <svg id="tree__svg-container" style="position:absolute; overflow:visible; pointer-events:none;">
//                     <g id="tree__path-group"></g>
//                 </svg>
//                 <div id="tree__nodes-container" style="position:relative;"></div>
//             </div>
//         </div>
//     `;
//     return {
//         viewport: document.getElementById('tree__viewport'),
//         holder: document.getElementById('tree__content-holder'),
//         pathGroup: document.getElementById('tree__path-group'),
//         nodes: document.getElementById('tree__nodes-container'),
//         panel: document.getElementById('config-panel'),
//         btnConfig: document.getElementById('btn-config'),
//         btnFit: document.getElementById('btn-fit'),
//         btnIn: document.getElementById('btn-zoom-in'),
//         btnOut: document.getElementById('btn-zoom-out')
//     };
// }

// function calculateLevelGapOuts(node) {
//     const level = node.y;
//     // Support hanya dihitung jika tidak collapsed
//     const supportCount = (!node._collapsed && node.supports) ? node.supports.length : 0;
//     const supportStacks = Math.ceil(supportCount / 2);
//     const requiredGap = supportStacks > 0 ? (supportStacks * (treeConfig.cardHeight + 15)) + 20 : treeConfig.gapOut;
//     if (!levelMaxGapOut[level] || requiredGap > levelMaxGapOut[level]) levelMaxGapOut[level] = requiredGap;
//     if (!node._collapsed && node.children) node.children.forEach(child => calculateLevelGapOuts(child));
// }

// function getGradientString(levelCfg) {
//     const stops = [...levelCfg.stops].sort((a, b) => a.pos - b.pos);
//     const stopString = stops.map(s => `${s.color} ${s.pos}%`).join(', ');
//     return `linear-gradient(${levelCfg.angle}deg, ${stopString})`;
// }

// function rebuildDiagram(dataRoot, elements) {
//     levelMaxGapOut = {};
//     calculateNodePositions(dataRoot);
//     calculateLevelGapOuts(dataRoot);
//     elements.nodes.innerHTML = ""; 
//     elements.pathGroup.innerHTML = "";
//     dataRoot.realY = 40;
//     renderTree(dataRoot, elements, dataRoot);
// }

// function renderTree(node, elements, dataRoot) {
//     const { nodes, pathGroup } = elements;
//     const localGapOut = levelMaxGapOut[node.y] || treeConfig.gapOut;
//     const posX = node.x * treeConfig.spacingX;
//     const posY = node.realY;

//     // 1. Render Kartu Utama
//     const cfg = jobLevelSettings[node.y] || jobLevelSettings[4];
//     const card = document.createElement('div');
//     card.style.cssText = `
//         position: absolute; width: ${treeConfig.cardWidth}px; height: ${treeConfig.cardHeight}px;
//         background: white; border: 1px solid #e2e8f0; border-radius: 8px;
//         left: ${posX}px; top: ${posY}px; display: flex; flex-direction: column; 
//         overflow: visible; box-shadow: 0 4px 6px rgba(0,0,0,0.05); z-index: 10;
//     `;
//     card.innerHTML = `
//         <div style="height:8px; width:100%; border-radius: 8px 8px 0 0; background: ${getGradientString(cfg)};"></div>
//         <div style="flex-grow:1; display:flex; align-items:center; justify-content:center; font-family:sans-serif; font-size:11px; font-weight:bold; color:#1e293b; padding:4px; text-align:center;">
//             ${node.id}
//         </div>
//     `;

//     // Tombol Collapse/Expand
//     const hasChildren = node.children && node.children.length > 0;
//     const hasSupports = node.supports && node.supports.length > 0;
//     if (hasChildren || hasSupports) {
//         const btn = document.createElement('div');
//         btn.style.cssText = `
//             position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%);
//             width: 20px; height: 20px; background: white; border: 2px solid #cbd5e1;
//             border-radius: 50%; cursor: pointer; display: flex; align-items: center;
//             justify-content: center; font-size: 14px; z-index: 20; font-weight: bold;
//             box-shadow: 0 2px 4px rgba(0,0,0,0.1); color: #475569;
//         `;
//         btn.innerHTML = node._collapsed ? "+" : "−";
//         btn.onclick = (e) => {
//             e.stopPropagation();
//             node._collapsed = !node._collapsed;
//             rebuildDiagram(dataRoot, elements);
//         };
//         card.appendChild(btn);
//     }
//     nodes.appendChild(card);

//     // 2. Render Cabang & Support HANYA jika TIDAK collapsed
//     if (!node._collapsed) {
//         // Render Support
//         if (node.supports) {
//             node.supports.forEach((sup, idx) => {
//                 const side = idx % 2 === 0 ? "right" : "left";
//                 renderSupportNode(node, sup, posY, elements, side, idx);
//             });
//         }

//         // Render Children
//         if (node.children && node.children.length > 0) {
//             const startX = posX + treeConfig.cardWidth / 2;
//             const startY = posY + treeConfig.cardHeight;
//             const horizontalBusY = startY + localGapOut;

//             node.children.forEach(child => {
//                 const childY = posY + treeConfig.cardHeight + localGapOut + treeConfig.gapIn + ((child.subLevel || 0) * (treeConfig.cardHeight + treeConfig.subLevelGap));
//                 child.realY = childY;
//                 const childX = (child.x * treeConfig.spacingX) + (treeConfig.cardWidth / 2);

//                 const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
//                 path.setAttribute("d", `M ${startX} ${startY} V ${horizontalBusY} H ${childX} V ${childY}`);
//                 path.setAttribute("stroke", "#cbd5e1");
//                 path.setAttribute("fill", "none");
//                 path.setAttribute("stroke-width", "2");
//                 pathGroup.appendChild(path);
//                 renderTree(child, elements, dataRoot);
//             });
//         }
//     }
// }

// function renderSupportNode(parentNode, support, parentY, elements, side, index) {
//     const { nodes, pathGroup } = elements;
//     const parentCenterX = (parentNode.x * treeConfig.spacingX) + treeConfig.cardWidth / 2;
//     const supportX = side === "right" ? parentCenterX + treeConfig.supportOffset : parentCenterX - treeConfig.supportOffset - treeConfig.cardWidth;
//     const supportY = parentY + treeConfig.cardHeight + 15 + (Math.floor(index / 2) * (treeConfig.cardHeight + 10));

//     support.realX = supportX; support.realY = supportY;

//     const sCard = document.createElement('div');
//     sCard.style.cssText = `position: absolute; width: ${treeConfig.cardWidth}px; height: ${treeConfig.cardHeight}px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; left: ${supportX}px; top: ${supportY}px; display: flex; align-items:center; justify-content:center; font-family:sans-serif; font-size:10px; color:#64748b;`;
//     sCard.innerHTML = support.id;
//     nodes.appendChild(sCard);

//     const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
//     const connectX = side === "right" ? supportX : supportX + treeConfig.cardWidth;
//     path.setAttribute("d", `M ${parentCenterX} ${supportY + (treeConfig.cardHeight / 2)} H ${connectX}`);
//     path.setAttribute("stroke", "#cbd5e1"); path.setAttribute("stroke-dasharray", "4");
//     path.setAttribute("fill", "none"); path.setAttribute("stroke-width", "2");
//     pathGroup.appendChild(path);
// }

// // ============================================ UI CONFIGURATOR ============================================

// function populateSidebar(elements, dataRoot) {
//     const colorContainer = document.getElementById('color-controls');
//     colorContainer.innerHTML = '';

//     Object.keys(jobLevelSettings).forEach(level => {
//         const cfg = jobLevelSettings[level];
//         const stopsStr = cfg.stops.map(s => `${s.color} ${s.pos}%`).join(', ');
//         const div = document.createElement('div');
//         div.className = "level-editor";
//         div.style.cssText = "margin-bottom: 25px; padding: 15px; background: #f1f5f9; border-radius: 8px;";
//         div.innerHTML = `
//             <label style="font-size:12px; font-weight:bold; display:block; margin-bottom:10px;">${cfg.label}</label>
//             <div class="grad-track" data-level="${level}" style="position:relative; height:20px; background:#ddd; border-radius:10px; cursor:copy; margin-bottom:30px; border:1px solid #ccc;">
//                 <div class="track-visual" style="position:absolute; inset:0; border-radius:10px; pointer-events:none; background: linear-gradient(90deg, ${stopsStr});"></div>
//                 ${cfg.stops.map((s, i) => `
//                     <div class="grad-stop" data-level="${level}" data-index="${i}" style="position:absolute; left:${s.pos}%; top:50%; transform:translate(-50%,-50%); width:18px; height:18px; background:${s.color}; border:2px solid white; border-radius:50%; box-shadow:0 2px 5px rgba(0,0,0,0.4); cursor:grab; z-index:20;"></div>
//                 `).join('')}
//             </div>
//             <div style="display:flex; align-items:center; gap:10px;">
//                 <div class="angle-wheel" data-level="${level}" style="width:34px; height:34px; border:2px solid #94a3b8; border-radius:50%; position:relative; cursor:crosshair; background:white;">
//                     <div class="needle" style="position:absolute; top:50%; left:50%; width:50%; height:2px; background:#1e293b; transform-origin:left; transform: translate(0, -50%) rotate(${cfg.angle - 90}deg);"></div>
//                 </div>
//                 <input type="number" class="angle-input" data-level="${level}" value="${cfg.angle}" style="width:50px; padding:4px; border:1px solid #cbd5e1; border-radius:4px;">
//                 <input type="color" class="color-pick" data-level="${level}" style="width:34px; height:34px; border:none; padding:0; background:none; cursor:pointer;">
//                 <button class="btn-del-stop" data-level="${level}" style="padding:4px 8px; color:white; background:#ef4444; border:none; border-radius:4px; font-size:10px; cursor:pointer;">Hapus</button>
//             </div>
//         `;

//         const cp = div.querySelector('.color-pick');
//         const tv = div.querySelector('.track-visual');
//         cp.value = cfg.stops[cfg.activeStopIndex || 0]?.color || "#ffffff";
        
//         cp.oninput = (e) => {
//             cfg.stops[cfg.activeStopIndex || 0].color = e.target.value;
//             const stopPoint = div.querySelector(`.grad-stop[data-index="${cfg.activeStopIndex || 0}"]`);
//             if (stopPoint) stopPoint.style.background = e.target.value;
//             tv.style.background = `linear-gradient(90deg, ${cfg.stops.map(s => `${s.color} ${s.pos}%`).join(', ')})`;
//             refreshDiagram(dataRoot, elements); 
//         };

//         div.querySelector('.angle-input').oninput = (e) => {
//             cfg.angle = parseInt(e.target.value) || 0;
//             div.querySelector('.needle').style.transform = `translate(0, -50%) rotate(${cfg.angle - 90}deg)`;
//             refreshDiagram(dataRoot, elements);
//         };

//         div.querySelector('.btn-del-stop').onclick = () => {
//             if (cfg.stops.length > 2) {
//                 cfg.stops.splice(cfg.activeStopIndex || 0, 1);
//                 cfg.activeStopIndex = 0;
//                 refreshUI(dataRoot, elements);
//             }
//         };

//         colorContainer.appendChild(div);
//     });
// }

// // ============================================ INTERACTION ============================================

// function initInteraction(elements, dataRoot) {
//     const { viewport, btnFit, btnIn, btnOut, btnConfig, panel } = elements;

//     viewport.onwheel = e => {
//         if (e.target.closest('#config-panel')) return; 
//         e.preventDefault();
//         applyZoom(Math.pow(1.1, -e.deltaY / 100), e.clientX, e.clientY, elements);
//     };

//     viewport.onmousedown = e => {
//         const stopEl = e.target.closest('.grad-stop');
//         const trackEl = e.target.closest('.grad-track');
//         const wheelEl = e.target.closest('.angle-wheel');

//         if (stopEl) {
//             e.stopPropagation();
//             activeDraggingStop = { level: stopEl.dataset.level, index: parseInt(stopEl.dataset.index) };
//             jobLevelSettings[activeDraggingStop.level].activeStopIndex = activeDraggingStop.index;
//             const picker = document.querySelector(`.color-pick[data-level="${activeDraggingStop.level}"]`);
//             if (picker) picker.value = jobLevelSettings[activeDraggingStop.level].stops[activeDraggingStop.index].color;
//             return;
//         }

//         if (trackEl) {
//             e.stopPropagation();
//             const rect = trackEl.getBoundingClientRect();
//             const pos = Math.round(((e.clientX - rect.left) / rect.width) * 100);
//             const level = trackEl.dataset.level;
//             jobLevelSettings[level].stops.push({ color: "#ffffff", pos: pos });
//             jobLevelSettings[level].stops.sort((a, b) => a.pos - b.pos);
//             refreshUI(dataRoot, elements);
//             return;
//         }

//         if (wheelEl) {
//             e.stopPropagation();
//             updateAngleFromMouse(e, wheelEl.dataset.level, dataRoot, elements);
//             return;
//         }

//         if (e.target.closest('#config-panel')) return;

//         if (e.target.id === 'tree__viewport' || e.target.closest('#tree__content-holder')) {
//             transformState.isDragging = true;
//             transformState.startX = e.clientX - transformState.x;
//             transformState.startY = e.clientY - transformState.y;
//             viewport.style.cursor = 'grabbing';
//         }
//     };

//     window.onmousemove = e => {
//         if (activeDraggingStop) {
//             const track = document.querySelector(`.grad-track[data-level="${activeDraggingStop.level}"]`);
//             const rect = track.getBoundingClientRect();
//             let pos = Math.round(((e.clientX - rect.left) / rect.width) * 100);
//             pos = Math.max(0, Math.min(100, pos));
//             jobLevelSettings[activeDraggingStop.level].stops[activeDraggingStop.index].pos = pos;
            
//             const stopUI = document.querySelector(`.grad-stop[data-level="${activeDraggingStop.level}"][data-index="${activeDraggingStop.index}"]`);
//             if (stopUI) stopUI.style.left = pos + "%";
//             const cfg = jobLevelSettings[activeDraggingStop.level];
//             const tv = track.querySelector('.track-visual');
//             if (tv) tv.style.background = `linear-gradient(90deg, ${cfg.stops.map(s => `${s.color} ${s.pos}%`).join(', ')})`;
//             refreshDiagram(dataRoot, elements);
//             return;
//         }

//         if (!transformState.isDragging) return;
//         transformState.x = e.clientX - transformState.startX;
//         transformState.y = e.clientY - transformState.startY;
//         updateTransform(elements);
//     };

//     window.onmouseup = () => {
//         if (activeDraggingStop) {
//             jobLevelSettings[activeDraggingStop.level].stops.sort((a, b) => a.pos - b.pos);
//             populateSidebar(elements, dataRoot); 
//             activeDraggingStop = null;
//         }
//         transformState.isDragging = false;
//         viewport.style.cursor = 'grab';
//     };

//     btnFit.onclick = () => fitToScreen(dataRoot, elements);
//     btnIn.onclick = () => applyZoom(1.2, window.innerWidth / 2, window.innerHeight / 2, elements);
//     btnOut.onclick = () => applyZoom(0.8, window.innerWidth / 2, window.innerHeight / 2, elements);

//     let panelOpen = false;
//     btnConfig.onclick = () => {
//         panelOpen = !panelOpen;
//         panel.style.left = panelOpen ? "0px" : "-320px";
//         if (panelOpen) populateSidebar(elements, dataRoot);
//     };
// }

// function updateAngleFromMouse(e, level, dataRoot, elements) {
//     const wheel = document.querySelector(`.angle-wheel[data-level="${level}"]`);
//     const rect = wheel.getBoundingClientRect();
//     const centerX = rect.left + rect.width / 2;
//     const centerY = rect.top + rect.height / 2;
//     const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
//     jobLevelSettings[level].angle = Math.round(angle + 90);
//     wheel.querySelector('.needle').style.transform = `translate(0, -50%) rotate(${jobLevelSettings[level].angle - 90}deg)`;
//     const input = document.querySelector(`.angle-input[data-level="${level}"]`);
//     if (input) input.value = jobLevelSettings[level].angle;
//     refreshDiagram(dataRoot, elements);
// }

// function applyZoom(factor, mX, mY, elements) {
//     const rect = elements.viewport.getBoundingClientRect();
//     const mouseX = mX - rect.left; const mouseY = mY - rect.top;
//     const newScale = Math.min(Math.max(transformState.scale * factor, 0.1), 3);
//     transformState.x = mouseX - (mouseX - transformState.x) * (newScale / transformState.scale);
//     transformState.y = mouseY - (mouseY - transformState.y) * (newScale / transformState.scale);
//     transformState.scale = newScale;
//     updateTransform(elements);
// }

// function updateTransform(elements) {
//     elements.holder.style.transition = transformState.isDragging ? "none" : "transform 0.1s ease-out";
//     elements.holder.style.transform = `translate(${transformState.x}px, ${transformState.y}px) scale(${transformState.scale})`;
// }

// function fitToScreen(root, elements) {
//     const vRect = elements.viewport.getBoundingClientRect();
//     let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
//     const traverse = n => {
//         const x = n.x * treeConfig.spacingX; const y = n.realY;
//         minX = Math.min(minX, x); maxX = Math.max(maxX, x + treeConfig.cardWidth);
//         minY = Math.min(minY, y); maxY = Math.max(maxY, y + treeConfig.cardHeight);
//         // Hitung support juga dalam fit to screen
//         if (!n._collapsed && n.supports) n.supports.forEach(s => {
//             minX = Math.min(minX, s.realX); maxX = Math.max(maxX, s.realX + treeConfig.cardWidth);
//             minY = Math.min(minY, s.realY); maxY = Math.max(maxY, s.realY + treeConfig.cardHeight);
//         });
//         if (!n._collapsed && n.children) n.children.forEach(traverse);
//     };
//     traverse(root);
//     const tW = maxX - minX; const tH = maxY - minY;
//     const scale = Math.min((vRect.width - 100) / (tW || 1), (vRect.height - 100) / (tH || 1), 1);
//     transformState.scale = scale;
//     transformState.x = (vRect.width / 2) - ((minX + tW / 2) * scale);
//     transformState.y = (vRect.height / 2) - ((minY + tH / 2) * scale);
//     updateTransform(elements);
// }


// function startEngine(data) {
//     const elements = initTreeContainer('org-chart-overview');
//     rebuildDiagram(data, elements);
//     initInteraction(elements, data);
//     setTimeout(() => fitToScreen(data, elements), 200);
// }

// startEngine(data);