import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "../utils/OrbitControls.js";
import { roomRoot } from "../models/objects.js";

// Inspection mode state
let isInspectionMode = false;
let inspectionScene = null;
let inspectionCamera = null;
let inspectionRenderer = null;
let inspectionControls = null;
let inspectionObject = null;
let graphNodes = [];
let animationFrameId = null;

// Current word data
let currentWordId = null;
let currentWordData = null;

// DOM elements
let inspectionOverlay = null;
let inspectionContainer = null;
let inspectionCanvas = null;
let wordInfoPanel = null;
let completeButton = null;

// Object to KG word mapping
const OBJECT_WORD_MAP = {
  "Hour_Hand": "Uhr",
  "Minute_Hand": "Uhr",
  "Clock": "Uhr",
};

export function initInspectionMode() {
  // Get DOM elements
  inspectionOverlay = document.getElementById("inspection-overlay");
  inspectionContainer = document.getElementById("inspection-container");
  inspectionCanvas = document.getElementById("inspection-canvas");
  wordInfoPanel = document.getElementById("word-info-panel");
  completeButton = document.getElementById("complete-word-btn");

  if (!inspectionCanvas) {
    console.error("Inspection canvas not found");
    return;
  }

  // Setup Three.js scene for inspection
  setupInspectionScene();

  // Setup event listeners
  setupEventListeners();
}

function setupInspectionScene() {
  // Create scene
  inspectionScene = new THREE.Scene();
  inspectionScene.background = new THREE.Color(0x1a1a2e);

  // Create camera
  inspectionCamera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  inspectionCamera.position.set(0, 0, 8);

  // Create renderer
  inspectionRenderer = new THREE.WebGLRenderer({
    canvas: inspectionCanvas,
    antialias: true,
    alpha: true,
  });
  inspectionRenderer.setSize(window.innerWidth, window.innerHeight);
  inspectionRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  inspectionScene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  inspectionScene.add(directionalLight);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLight2.position.set(-5, -5, 5);
  inspectionScene.add(directionalLight2);

  const pointLight = new THREE.PointLight(0x6366f1, 1, 15);
  pointLight.position.set(0, 2, 4);
  inspectionScene.add(pointLight);

  // Create controls
  inspectionControls = new OrbitControls(inspectionCamera, inspectionCanvas);
  inspectionControls.enableDamping = true;
  inspectionControls.dampingFactor = 0.05;
  inspectionControls.minDistance = 3;
  inspectionControls.maxDistance = 15;
  inspectionControls.autoRotate = true;
  inspectionControls.autoRotateSpeed = 0.5;
}

function setupEventListeners() {
  // Close button
  const closeBtn = document.getElementById("close-inspection-btn");
  closeBtn?.addEventListener("click", closeInspectionMode);

  // Complete button
  completeButton?.addEventListener("click", handleCompleteWord);

  // ESC key to close
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isInspectionMode) {
      closeInspectionMode();
    }
  });

  // Handle resize
  window.addEventListener("resize", () => {
    if (isInspectionMode && inspectionCamera && inspectionRenderer) {
      inspectionCamera.aspect = window.innerWidth / window.innerHeight;
      inspectionCamera.updateProjectionMatrix();
      inspectionRenderer.setSize(window.innerWidth, window.innerHeight);
    }
  });
}

export function getWordIdForObject(objectName) {
  for (const [key, wordId] of Object.entries(OBJECT_WORD_MAP)) {
    if (objectName.includes(key)) {
      return wordId;
    }
  }
  return null;
}

export async function openInspectionMode(object, objectName) {
  if (isInspectionMode) return;

  const wordId = getWordIdForObject(objectName);
  if (!wordId) {
    console.warn(`No word mapping for object: ${objectName}`);
    return;
  }

  currentWordId = wordId;
  isInspectionMode = true;

  // Show overlay with animation
  if (inspectionOverlay) {
    inspectionOverlay.style.display = "block";
    gsap.fromTo(inspectionOverlay, 
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: "power2.out" }
    );
  }

  // Create a proper clock object for display
  inspectionObject = createClockMesh();
  inspectionScene.add(inspectionObject);

  // Fetch KG data and create graph nodes
  await fetchAndDisplayGraph(wordId);

  // Start animation loop
  animateInspection();
}

// Create a stylized clock mesh for inspection
function createClockMesh() {
  const group = new THREE.Group();

  // Clock face (circle)
  const faceGeometry = new THREE.CircleGeometry(1, 64);
  const faceMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf5f5dc,
    metalness: 0.1,
    roughness: 0.3,
    side: THREE.DoubleSide,
  });
  const face = new THREE.Mesh(faceGeometry, faceMaterial);
  group.add(face);

  // Clock rim
  const rimGeometry = new THREE.TorusGeometry(1, 0.08, 16, 100);
  const rimMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    metalness: 0.6,
    roughness: 0.3,
  });
  const rim = new THREE.Mesh(rimGeometry, rimMaterial);
  group.add(rim);

  // Hour markers
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const markerGeometry = new THREE.BoxGeometry(0.08, 0.15, 0.02);
    const markerMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.x = Math.cos(angle) * 0.85;
    marker.position.y = Math.sin(angle) * 0.85;
    marker.position.z = 0.01;
    marker.rotation.z = angle + Math.PI / 2;
    group.add(marker);
  }

  // Hour hand
  const hourHandGeometry = new THREE.BoxGeometry(0.08, 0.5, 0.03);
  const hourHandMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
  const hourHand = new THREE.Mesh(hourHandGeometry, hourHandMaterial);
  hourHand.position.y = 0.2;
  hourHand.position.z = 0.02;
  
  const hourHandGroup = new THREE.Group();
  hourHandGroup.add(hourHand);
  hourHandGroup.rotation.z = -Math.PI / 6; // Point to 1 o'clock
  group.add(hourHandGroup);

  // Minute hand
  const minuteHandGeometry = new THREE.BoxGeometry(0.05, 0.7, 0.03);
  const minuteHandMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
  const minuteHand = new THREE.Mesh(minuteHandGeometry, minuteHandMaterial);
  minuteHand.position.y = 0.3;
  minuteHand.position.z = 0.03;
  
  const minuteHandGroup = new THREE.Group();
  minuteHandGroup.add(minuteHand);
  minuteHandGroup.rotation.z = Math.PI / 3; // Point to 10
  group.add(minuteHandGroup);

  // Center cap
  const capGeometry = new THREE.CircleGeometry(0.08, 32);
  const capMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
  const cap = new THREE.Mesh(capGeometry, capMaterial);
  cap.position.z = 0.04;
  group.add(cap);

  return group;
}

async function fetchAndDisplayGraph(wordId) {
  try {
    const response = await fetch(`http://localhost:8000/kg/word/${wordId}/graph`);
    if (!response.ok) throw new Error("Failed to fetch word graph");
    
    const data = await response.json();
    currentWordData = data;

    // Update word info panel
    updateWordInfoPanel(data.word);

    // Create 3D graph nodes
    createGraphNodes(data.graph);
  } catch (error) {
    console.error("Error fetching KG graph:", error);
    // Show error in panel
    if (wordInfoPanel) {
      wordInfoPanel.innerHTML = `
        <div class="word-error">
          <p>Failed to load word data</p>
        </div>
      `;
    }
  }
}

function updateWordInfoPanel(word) {
  if (!wordInfoPanel) return;

  wordInfoPanel.innerHTML = `
    <div class="word-header">
      <h2 class="word-german">${word.german}</h2>
      <span class="word-level">${word.level}</span>
    </div>
    <div class="word-ipa">${word.ipa || ""}</div>
    <div class="word-translations">
      ${word.translations.map(t => `<span class="translation">${t}</span>`).join(", ")}
    </div>
    <div class="word-pos">${word.pos}${word.gender ? ` (${word.gender})` : ""}</div>
    <div class="word-examples">
      <h4>Examples:</h4>
      <ul>
        ${word.examples.slice(0, 3).map(ex => `<li>${ex}</li>`).join("")}
      </ul>
    </div>
  `;
}

function createGraphNodes(graph) {
  // Clear existing nodes
  clearGraphNodes();

  const radius = 4;
  const nonCenterNodes = graph.nodes.filter(n => n.id !== "center");
  const nodeCount = nonCenterNodes.length;

  nonCenterNodes.forEach((node, index) => {
    // Calculate position in a sphere around the object
    const phi = Math.acos(-1 + (2 * index) / nodeCount);
    const theta = Math.sqrt(nodeCount * Math.PI) * phi;
    
    const x = radius * Math.cos(theta) * Math.sin(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi) * 0.6; // Flatten Y axis a bit
    const z = radius * Math.cos(phi) * 0.8;

    // Create card based on node type
    let title = node.label;
    let subtitle = "";
    let color = 0x6366f1;

    switch (node.type) {
      case "translation":
        subtitle = "Translation";
        color = 0x22c55e;
        break;
      case "meaning":
        subtitle = "Meaning";
        color = 0xf59e0b;
        title = node.label.length > 80 ? node.label.substring(0, 80) + "..." : node.label;
        break;
      case "example":
        subtitle = "Example";
        color = 0x3b82f6;
        title = node.label.length > 80 ? node.label.substring(0, 80) + "..." : node.label;
        break;
    }

    // Create a card with text
    const cardGroup = createSimpleCard(title, subtitle, color);
    cardGroup.position.set(x, y, z);
    
    // Make card face the center
    cardGroup.lookAt(0, 0, 0);
    
    // Animate entry
    cardGroup.scale.set(0, 0, 0);
    gsap.to(cardGroup.scale, {
      x: 1, y: 1, z: 1,
      duration: 0.5,
      delay: index * 0.1,
      ease: "back.out(1.7)"
    });

    inspectionScene.add(cardGroup);
    graphNodes.push(cardGroup);

    // Create line from center to node
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: color,
      transparent: true,
      opacity: 0.4
    });
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(x, y, z)
    ]);
    const line = new THREE.Line(lineGeometry, lineMaterial);
    inspectionScene.add(line);
    graphNodes.push(line);
  });
}

function createSimpleCard(title, subtitle, color) {
  const group = new THREE.Group();

  // Card dimensions
  const cardWidth = 2.0;
  const cardHeight = 1.0;

  // Create canvas for text
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 256;

  // Fill background with dark transparent color
  ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw colored border
  const borderColor = '#' + color.toString(16).padStart(6, '0');
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);

  // Draw subtitle (type label)
  ctx.fillStyle = borderColor;
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(subtitle.toUpperCase(), canvas.width / 2, 40);

  // Draw title (content)
  ctx.fillStyle = '#ffffff';
  ctx.font = '28px Arial, sans-serif';
  
  // Word wrap the title
  const maxWidth = canvas.width - 40;
  const words = title.split(' ');
  let line = '';
  let y = 100;
  const lineHeight = 36;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), canvas.width / 2, y);
      line = words[i] + ' ';
      y += lineHeight;
      if (y > 220) {
        // Truncate if too long
        ctx.fillText(line.trim() + '...', canvas.width / 2, y);
        break;
      }
    } else {
      line = testLine;
    }
  }
  if (y <= 220) {
    ctx.fillText(line.trim(), canvas.width / 2, y);
  }

  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  // Card mesh with texture
  const cardGeometry = new THREE.PlaneGeometry(cardWidth, cardHeight);
  const cardMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const card = new THREE.Mesh(cardGeometry, cardMaterial);
  group.add(card);

  // Store data for reference
  group.userData = { title, subtitle, color };

  return group;
}

function clearGraphNodes() {
  graphNodes.forEach(node => {
    if (node.geometry) node.geometry.dispose();
    if (node.material) {
      if (Array.isArray(node.material)) {
        node.material.forEach(m => m.dispose());
      } else {
        node.material.dispose();
      }
    }
    inspectionScene.remove(node);
  });
  graphNodes = [];
}

function animateInspection() {
  if (!isInspectionMode) return;

  animationFrameId = requestAnimationFrame(animateInspection);

  // Rotate the inspected object slowly
  if (inspectionObject) {
    inspectionObject.rotation.y += 0.005;
  }

  inspectionControls?.update();
  inspectionRenderer?.render(inspectionScene, inspectionCamera);
}

export function closeInspectionMode() {
  if (!isInspectionMode) return;

  isInspectionMode = false;

  // Stop animation
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // Hide overlay with animation
  gsap.to(inspectionOverlay, {
    opacity: 0,
    duration: 0.3,
    ease: "power2.in",
    onComplete: () => {
      if (inspectionOverlay) {
        inspectionOverlay.style.display = "none";
      }
    }
  });

  // Clean up
  if (inspectionObject) {
    inspectionScene.remove(inspectionObject);
    inspectionObject = null;
  }
  clearGraphNodes();

  currentWordId = null;
  currentWordData = null;
}

async function handleCompleteWord() {
  if (!currentWordId) return;

  try {
    // Get auth token from cookies
    const token = document.cookie
      .split("; ")
      .find(row => row.startsWith("auth_token="))
      ?.split("=")[1];

    if (!token) {
      alert("Please log in to track your progress");
      return;
    }

    // Start the word first
    await fetch(`http://localhost:8000/learning/words/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        word_id: currentWordId,
        room_id: currentWordData?.word?.level || "A1"
      })
    });

    // Complete the word
    const response = await fetch(`http://localhost:8000/learning/words/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        word_id: currentWordId,
        room_id: currentWordData?.word?.level || "A1"
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to complete word");
    }

    const result = await response.json();

    // Show success feedback
    showCompletionFeedback(result);

    // Close inspection mode after a short delay
    setTimeout(() => {
      closeInspectionMode();
    }, 2000);

  } catch (error) {
    console.error("Error completing word:", error);
    alert(error.message || "Failed to mark word as complete");
  }
}

function showCompletionFeedback(result) {
  // Create success overlay
  const feedback = document.createElement("div");
  feedback.className = "completion-feedback";
  feedback.innerHTML = `
    <div class="feedback-content">
      <div class="feedback-icon">&#10003;</div>
      <h3>Word Completed!</h3>
      <p>${result.message}</p>
    </div>
  `;
  
  inspectionContainer?.appendChild(feedback);

  // Animate in
  gsap.fromTo(feedback, 
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
  );

  // Remove after animation
  setTimeout(() => {
    feedback.remove();
  }, 2000);
}

export { isInspectionMode, OBJECT_WORD_MAP };
