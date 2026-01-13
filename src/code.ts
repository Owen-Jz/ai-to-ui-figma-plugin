// AI-to-UI Figma Plugin - Main Logic
// Recursively builds native Figma elements from AI-generated JSON

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Padding {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}

interface FillStyle {
    type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL';
    color?: string;
    opacity?: number;
}

interface StrokeStyle {
    type: 'SOLID';
    color: string;
    opacity?: number;
}

interface ShadowEffect {
    type: 'DROP_SHADOW' | 'INNER_SHADOW';
    color: string;
    offset?: { x: number; y: number };
    radius: number;
    spread?: number;
    visible?: boolean;
}

interface BlurEffect {
    type: 'LAYER_BLUR' | 'BACKGROUND_BLUR';
    radius: number;
    visible?: boolean;
}

type EffectStyle = ShadowEffect | BlurEffect;

// ============================================================================
// PHOSPHOR ICONS - SVG Path Data (Regular weight, 256x256 viewBox)
// ============================================================================

const PHOSPHOR_ICONS: Record<string, string> = {
    // Navigation
    'house': 'M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V168h32v48a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM208,208H168V160a8,8,0,0,0-8-8H96a8,8,0,0,0-8,8v48H48V120l80-80,80,80Z',
    'magnifying-glass': 'M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z',
    'gear': 'M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z',
    'bell': 'M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216Zm-80-32c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z',
    'user': 'M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z',
    'users': 'M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z',
    'arrow-left': 'M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z',
    'arrow-right': 'M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H32a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z',
    'x': 'M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z',
    'list': 'M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z',
    
    // Actions
    'plus': 'M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z',
    'minus': 'M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z',
    'pencil': 'M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z',
    'trash': 'M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z',
    'download': 'M224,152v56a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V152a8,8,0,0,1,16,0v56H208V152a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,132.69V40a8,8,0,0,0-16,0v92.69L93.66,106.34a8,8,0,0,0-11.32,11.32Z',
    'upload': 'M224,152v56a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V152a8,8,0,0,1,16,0v56H208V152a8,8,0,0,1,16,0ZM93.66,85.66,120,59.31V152a8,8,0,0,0,16,0V59.31l26.34,26.35a8,8,0,0,0,11.32-11.32l-40-40a8,8,0,0,0-11.32,0l-40,40A8,8,0,0,0,93.66,85.66Z',
    'share': 'M229.66,109.66l-48,48a8,8,0,0,1-11.32-11.32L204.69,112H165a88,88,0,0,0-85.23,66,8,8,0,0,1-15.5-4A103.94,103.94,0,0,1,165,96h39.71L170.34,61.66a8,8,0,0,1,11.32-11.32l48,48A8,8,0,0,1,229.66,109.66ZM192,208H40V88a8,8,0,0,0-16,0V208a16,16,0,0,0,16,16H192a8,8,0,0,0,0-16Z',
    'copy': 'M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z',
    'check': 'M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z',
    'x-circle': 'M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm37.66-130.34a8,8,0,0,1,0,11.32L147.31,128l18.35,18.34a8,8,0,0,1-11.32,11.32L136,139.31l-18.34,18.35a8,8,0,0,1-11.32-11.32L124.69,128l-18.35-18.34a8,8,0,0,1,11.32-11.32L136,116.69l18.34-18.35A8,8,0,0,1,165.66,85.66Z',
    
    // Media
    'image': 'M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM144,100a12,12,0,1,1,12,12A12,12,0,0,1,144,100Zm46.14,53.47-25.66-25.65a8,8,0,0,0-11,0L93.66,187.5a8,8,0,0,1-11.32-11.32l60-60a24,24,0,0,1,33.94,0l25.66,25.66a8,8,0,0,1-11.32,11.31Z',
    'camera': 'M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.71,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.66-3.56L100.28,48h55.43l13.63,20.44A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM128,88a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,88Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,128,160Z',
    'video': 'M164.44,105.34l-48-32A8,8,0,0,0,104,80v64a8,8,0,0,0,12.44,6.66l48-32a8,8,0,0,0,0-13.32ZM120,129.05V95l25.58,17ZM216,40H40A16,16,0,0,0,24,56V168a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,128H40V56H216V168Zm16,40a8,8,0,0,1-8,8H32a8,8,0,0,1,0-16H224A8,8,0,0,1,232,208Z',
    'play': 'M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z',
    'pause': 'M216,48V208a16,16,0,0,1-16,16H160a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h40A16,16,0,0,1,216,48ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Z',
    'stop': 'M200,40H56A16,16,0,0,0,40,56V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,160H56V56H200V200Z',
    'music-note': 'M210.3,56.34l-80-24A8,8,0,0,0,120,40V148.26A48,48,0,1,0,136,184V50.75l69.7,20.91a8,8,0,1,0,4.6-15.32ZM88,216a32,32,0,1,1,32-32A32,32,0,0,1,88,216Z',
    'microphone': 'M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm40,143.6V232a8,8,0,0,1-16,0V207.6A80.11,80.11,0,0,1,48,128a8,8,0,0,1,16,0,64,64,0,0,0,128,0,8,8,0,0,1,16,0A80.11,80.11,0,0,1,136,207.6Z',
    'speaker-high': 'M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM144,207.64,84.91,161.69A7.94,7.94,0,0,0,80,160H32V96H80a7.94,7.94,0,0,0,4.91-1.69L144,48.36Zm54-106.08a40,40,0,0,1,0,52.88,8,8,0,0,1-12-10.58,24,24,0,0,0,0-31.72,8,8,0,0,1,12-10.58Zm35.77-35.77a104,104,0,0,1,0,124.42,8,8,0,0,1-13.54-8.5,88,88,0,0,0,0-107.42,8,8,0,0,1,13.54-8.5Z',
    'speaker-x': 'M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM144,207.64,84.91,161.69A7.94,7.94,0,0,0,80,160H32V96H80a7.94,7.94,0,0,0,4.91-1.69L144,48.36Zm101.66-61.3a8,8,0,0,1-11.32,11.32L216,139.31l-18.34,18.35a8,8,0,0,1-11.32-11.32L204.69,128l-18.35-18.34a8,8,0,0,1,11.32-11.32L216,116.69l18.34-18.35a8,8,0,0,1,11.32,11.32L227.31,128Z',
    
    // Communication
    'envelope': 'M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-96,85.15L52.57,64H203.43ZM98.71,128,40,181.81V74.19Zm11.84,10.85,12,11.05a8,8,0,0,0,10.82,0l12-11.05,58,53.15H52.57ZM157.29,128,216,74.18V181.82Z',
    'chat': 'M216,48H40A16,16,0,0,0,24,64V224a15.84,15.84,0,0,0,9.25,14.5A16.05,16.05,0,0,0,40,240a15.89,15.89,0,0,0,10.25-3.78.69.69,0,0,0,.13-.11L82.5,208H216a16,16,0,0,0,16-16V64A16,16,0,0,0,216,48ZM40,224h0ZM216,192H82.5a16,16,0,0,0-10.3,3.75l-.12.11L40,224V64H216Z',
    'phone': 'M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16,16,0,0,0,1.32-15.06l0-.12L97.54,33.64a16,16,0,0,0-16.62-9.52A56.26,56.26,0,0,0,32,80c0,79.4,64.6,144,144,144a56.26,56.26,0,0,0,55.88-48.92A16,16,0,0,0,222.37,158.46ZM176,208A128.14,128.14,0,0,1,48,80,40.2,40.2,0,0,1,82.87,40a.61.61,0,0,0,0,.12l21,47L83.2,111.86a6.13,6.13,0,0,0-.57.77,16,16,0,0,0-1,15.7c9.06,18.53,27.73,37.06,46.46,46.11a16,16,0,0,0,15.75-1.14,8.44,8.44,0,0,0,.74-.56L168.89,152l47,21.05h0s.08,0,.11,0A40.21,40.21,0,0,1,176,208Z',
    'paper-plane-tilt': 'M227.32,28.68a16,16,0,0,0-15.66-4.08l-.15,0L19.57,82.84a16,16,0,0,0-2.42,29.84l85.62,40.55,40.55,85.62A15.86,15.86,0,0,0,157.74,248h.58a15.88,15.88,0,0,0,14.15-9.57l58.18-191.94,0-.15A16,16,0,0,0,227.32,28.68ZM157.83,231.85l-.05.14-39.36-83.09,47.24-47.25a8,8,0,0,0-11.31-11.31L107.1,137.58,24,98.22l.14,0L216,40Z',
    'at': 'M128,24a104,104,0,0,0,0,208c21.51,0,44.1-6.48,60.43-17.33a8,8,0,0,0-8.86-13.33C166,210.38,146.21,216,128,216a88,88,0,1,1,88-88c0,26.45-10.88,32-20,32s-20-5.55-20-32V88a8,8,0,0,0-16,0v4.26a48,48,0,1,0,5.93,65.1c6,12,16.35,18.64,30.07,18.64,22.54,0,36-17.94,36-48A104.11,104.11,0,0,0,128,24Zm0,136a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z',
    'link': 'M137.54,186.36a8,8,0,0,1,0,11.31l-9.94,10A56,56,0,0,1,48.38,128.4L72.5,104.28A56,56,0,0,1,149.31,102a8,8,0,1,1-10.64,12,40,40,0,0,0-54.85,1.63L59.7,139.72a40,40,0,0,0,56.58,56.58l9.94-9.94A8,8,0,0,1,137.54,186.36Zm70.08-138a56.06,56.06,0,0,0-79.22,0l-9.94,9.95a8,8,0,0,0,11.32,11.31l9.94-9.94a40,40,0,0,1,56.58,56.58L172.18,140.4A40,40,0,0,1,117.33,142,8,8,0,1,0,106.69,154a56,56,0,0,0,76.81-2.26l24.12-24.12A56.06,56.06,0,0,0,207.62,48.38Z',
    'globe': 'M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm88,104a87.62,87.62,0,0,1-6.4,32.94l-44.7-27.49a15.92,15.92,0,0,0-6.24-2.23l-22.82-3.08a16.11,16.11,0,0,0-16,7.86h-8.72l-3.8-7.86a15.91,15.91,0,0,0-11-8.67l-8-1.73L96.14,104h16.71a16.06,16.06,0,0,0,7.73-2l12.25-6.76a16.62,16.62,0,0,0,3-2.14l26.91-24.34A15.93,15.93,0,0,0,166,63.4V39a87.76,87.76,0,0,1,50,89ZM40,128a87.76,87.76,0,0,1,50-79v47a15.93,15.93,0,0,0,3.25,9.67l3.77,5a16.08,16.08,0,0,0,9.68,5.94l8,1.73,7.51,15.55a16.09,16.09,0,0,0,14.49,9.12h4.81l32.74,82.72a88.17,88.17,0,0,1-134.25-96.71Z',
    'wifi': 'M140,204a12,12,0,1,1-12-12A12,12,0,0,1,140,204ZM237.08,87A172,172,0,0,0,18.92,87,8,8,0,0,0,29.07,98.65a156,156,0,0,1,197.86,0A8,8,0,0,0,237.08,87ZM205,122.77a124,124,0,0,0-153.94,0A8,8,0,0,0,61,135.31a108,108,0,0,1,134.06,0,8,8,0,0,0,9.95-12.54ZM173,158.53a76,76,0,0,0-90.06,0A8,8,0,1,0,92.48,172a60,60,0,0,1,71,0,8,8,0,1,0,9.5-12.88Z',
    'bluetooth': 'M188.8,169.6,133.33,128,188.8,86.4a8,8,0,0,0,0-12.8l-64-48A8,8,0,0,0,112,32v80L60.8,73.6a8,8,0,1,0-9.6,12.8L106.67,128,51.2,169.6a8,8,0,1,0,9.6,12.8L112,144v80a8,8,0,0,0,12.8,6.4l64-48a8,8,0,0,0,0-12.8ZM128,48l42.67,32L128,112Zm0,160V144l42.67,32Z',
    'cloud': 'M160,40A88.09,88.09,0,0,0,81.29,88.67,64,64,0,1,0,72,216h88a88,88,0,0,0,0-176Zm0,160H72a48,48,0,0,1,0-96c1.1,0,2.2,0,3.29.11A88,88,0,0,0,72,128a8,8,0,0,0,16,0,72,72,0,1,1,72,72Z',
    
    // Commerce
    'shopping-cart': 'M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16H34.05l35.92,179.59A24,24,0,1,0,96,232a24,24,0,0,0,23.61-20h56.79A24,24,0,1,0,200,232a24,24,0,0,0,24-24,8,8,0,0,0-8-8H91.17a8,8,0,0,1-7.87-6.57L80.13,178h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87ZM96,216a8,8,0,1,1-8,8A8,8,0,0,1,96,216Zm104,8a8,8,0,1,1,8-8A8,8,0,0,1,200,224Zm4-48H76.51L64.94,72H207.06Z',
    'credit-card': 'M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,16V88H32V64Zm0,128H32V104H224v88Zm-16-24a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h32A8,8,0,0,1,208,168Zm-64,0a8,8,0,0,1-8,8H120a8,8,0,0,1,0-16h16A8,8,0,0,1,144,168Z',
    'wallet': 'M216,64H56a8,8,0,0,1,0-16H192a8,8,0,0,0,0-16H56A24,24,0,0,0,32,56V184a24,24,0,0,0,24,24H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64Zm0,128H56a8,8,0,0,1-8-8V78.63A23.84,23.84,0,0,0,56,80H216Zm-36-56a12,12,0,1,1,12-12A12,12,0,0,1,180,136Z',
    'receipt': 'M72,104a8,8,0,0,1,8-8h96a8,8,0,0,1,0,16H80A8,8,0,0,1,72,104Zm8,40h96a8,8,0,0,0,0-16H80a8,8,0,0,0,0,16ZM232,56V208a8,8,0,0,1-11.58,7.15L192,200.94l-28.42,14.21a8,8,0,0,1-7.16,0L128,200.94,99.58,215.15a8,8,0,0,1-7.16,0L64,200.94,35.58,215.15A8,8,0,0,1,24,208V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56Zm-16,0H40V195.06l20.42-10.22a8,8,0,0,1,7.16,0L96,199.06l28.42-14.22a8,8,0,0,1,7.16,0L160,199.06l28.42-14.22a8,8,0,0,1,7.16,0L216,195.06Z',
    'tag': 'M243.31,136,144,36.69A15.86,15.86,0,0,0,132.69,32H40a8,8,0,0,0-8,8v92.69A15.86,15.86,0,0,0,36.69,144L136,243.31a16,16,0,0,0,22.63,0l84.68-84.68a16,16,0,0,0,0-22.63Zm-96,96L48,132.69V48h84.69L232,147.31ZM96,84A12,12,0,1,1,84,72,12,12,0,0,1,96,84Z',
    'storefront': 'M232,96a7.89,7.89,0,0,0-.3-2.2L217.35,43.6A16.07,16.07,0,0,0,202,32H54A16.07,16.07,0,0,0,38.65,43.6L24.31,93.8A7.89,7.89,0,0,0,24,96a40,40,0,0,0,16,32v96a8,8,0,0,0,8,8H208a8,8,0,0,0,8-8V128A40,40,0,0,0,232,96ZM54,48H202l11.42,40H42.61Zm50,56h48v8a24,24,0,0,1-48,0Zm-16,0v8a24,24,0,0,1-48,0v-8Zm112,112H56V141.44a40.08,40.08,0,0,0,48-15.75,40,40,0,0,0,64,0,40.08,40.08,0,0,0,32,15.75Zm16-104a24,24,0,0,1-24-24v-8h48v8A24,24,0,0,1,216,112Z',
    'package': 'M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32l80.34,44-29.77,16.3-80.35-44ZM128,120,47.66,76l33.9-18.56,80.34,44ZM40,90l80,43.78v85.79L40,175.82Zm176,85.78h0l-80,43.79V133.82l32-17.51V152a8,8,0,0,0,16,0V107.55L216,90v85.77Z',
    'truck': 'M247.42,117l-14-35A15.93,15.93,0,0,0,218.58,72H184V64a8,8,0,0,0-8-8H24A16,16,0,0,0,8,72V184a16,16,0,0,0,16,16H41a32,32,0,0,0,62,0h50a32,32,0,0,0,62,0h17a16,16,0,0,0,16-16V120A7.94,7.94,0,0,0,247.42,117ZM184,88h34.58l9.6,24H184ZM24,72H168v64H24ZM72,208a16,16,0,1,1,16-16A16,16,0,0,1,72,208Zm81-24H103a32,32,0,0,0-62,0H24V152H168v12.31A32.11,32.11,0,0,0,153,184Zm31,24a16,16,0,1,1,16-16A16,16,0,0,1,184,208Zm48-24H201a32.06,32.06,0,0,0-17-21.41V128h48Z',
    'star': 'M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51.07,31a16,16,0,0,1-23.84-17.34l13.49-58.54L21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Zm-23.41-12-54.1-4.69a8,8,0,0,1-6.67-4.85L128,44.65,105.68,92.79a8,8,0,0,1-6.67,4.85l-54.1,4.69,41.06,35.82a8,8,0,0,1,2.59,7.91L75.82,199l47.53-28.88a8,8,0,0,1,8.3,0L179.18,199l-12.74-53a8,8,0,0,1,2.59-7.91Z',
    'heart': 'M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32ZM128,206.8C109.74,196.16,32,147.69,32,94A46.06,46.06,0,0,1,78,48c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,147.61,146.24,196.15,128,206.8Z',
};

interface NodeData {
    type: 'FRAME' | 'TEXT' | 'IMAGE' | 'RECTANGLE' | 'ICON';
    name?: string;

    // Layout properties
    layoutMode?: 'HORIZONTAL' | 'VERTICAL';
    primaryAxisAlignItems?: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN';
    counterAxisAlignItems?: 'MIN' | 'MAX' | 'CENTER';
    primaryAxisSizingMode?: 'FIXED' | 'AUTO';
    counterAxisSizingMode?: 'FIXED' | 'AUTO';
    itemSpacing?: number;
    padding?: Padding;

    // Sizing
    width?: 'fill' | 'hug' | number;
    height?: 'fill' | 'hug' | number;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;

    // Position (only used when absolute: true or layoutPositioning: 'ABSOLUTE')
    absolute?: boolean;
    x?: number;
    y?: number;

    // Auto-layout absolute positioning (for children within auto-layout parents)
    layoutPositioning?: 'AUTO' | 'ABSOLUTE';
    constraints?: {
        horizontal?: 'MIN' | 'MAX' | 'CENTER' | 'STRETCH' | 'SCALE';
        vertical?: 'MIN' | 'MAX' | 'CENTER' | 'STRETCH' | 'SCALE';
    };

    // Styling
    fills?: FillStyle[];
    strokes?: StrokeStyle[];
    strokeWeight?: number;
    strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER';
    cornerRadius?: number;
    topLeftRadius?: number;
    topRightRadius?: number;
    bottomLeftRadius?: number;
    bottomRightRadius?: number;
    effects?: EffectStyle[];
    opacity?: number;

    // Text properties
    characters?: string;
    fontSize?: number;
    fontWeight?: 'Regular' | 'Medium' | 'Bold' | 'Light' | 'SemiBold' | 'ExtraBold';
    fontFamily?: string;
    textColor?: string;
    textAlign?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
    lineHeight?: number | 'AUTO';
    letterSpacing?: number;
    textDecoration?: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';

    // Image properties
    src?: string;

    // Icon properties
    icon?: string;
    size?: number;
    color?: string;

    // Children
    children?: NodeData[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse hex color to RGB object (0-1 range)
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Handle shorthand hex (e.g., #FFF)
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }

    // Handle 8-character hex (with alpha)
    if (hex.length === 8) {
        hex = hex.substring(0, 6);
    }

    const bigint = parseInt(hex, 16);
    return {
        r: ((bigint >> 16) & 255) / 255,
        g: ((bigint >> 8) & 255) / 255,
        b: (bigint & 255) / 255
    };
}

/**
 * Parse hex color alpha if present (8-char hex)
 */
function hexToAlpha(hex: string): number {
    hex = hex.replace(/^#/, '');
    if (hex.length === 8) {
        return parseInt(hex.substring(6, 8), 16) / 255;
    }
    return 1;
}

// ============================================================================
// FAKE DATA GENERATION (Faker-like functionality)
// ============================================================================

const FIRST_NAMES = [
    'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
    'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
    'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Lisa', 'Daniel', 'Nancy',
    'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
    'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
    'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa',
    'Timothy', 'Deborah', 'Ronald', 'Stephanie', 'Edward', 'Rebecca', 'Jason', 'Sharon'
];

const LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
    'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
    'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
    'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell'
];

const COMPANY_NAMES = [
    'Acme Corp', 'TechStart', 'Innovate Labs', 'Digital Dynamics', 'CloudNine Solutions',
    'Apex Industries', 'Quantum Systems', 'Nexus Technologies', 'Fusion Enterprises',
    'Stellar Innovations', 'Vertex Global', 'Pulse Digital', 'Summit Partners', 'Horizon Tech',
    'Catalyst Ventures', 'Synergy Solutions', 'Elevate Inc', 'Pinnacle Group', 'Vanguard Systems'
];

const JOB_TITLES = [
    'Software Engineer', 'Product Manager', 'UX Designer', 'Data Scientist', 'Marketing Manager',
    'Sales Director', 'Frontend Developer', 'Backend Engineer', 'DevOps Engineer', 'CEO',
    'CTO', 'CFO', 'Project Manager', 'Business Analyst', 'QA Engineer', 'UI Designer',
    'Full Stack Developer', 'Cloud Architect', 'Security Engineer', 'Technical Lead'
];

const LOREM_WORDS = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
];

const STREET_NAMES = [
    'Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Pine Rd', 'Elm St', 'Washington Blvd',
    'Park Ave', 'Lake Dr', 'Hill St', 'River Rd', 'Broadway', 'Market St', 'Church St'
];

const CITIES = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
    'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus',
    'Charlotte', 'Seattle', 'Denver', 'Boston', 'Portland', 'Miami'
];

const COUNTRIES = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan',
    'Brazil', 'India', 'Mexico', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Singapore'
];

/**
 * Get random element from array
 */
function randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate fake data based on placeholder type
 */
function generateFakeData(placeholder: string): string {
    const type = placeholder.toLowerCase().trim();
    
    switch (type) {
        // Names
        case 'firstname':
        case 'first_name':
            return randomElement(FIRST_NAMES);
        
        case 'lastname':
        case 'last_name':
            return randomElement(LAST_NAMES);
        
        case 'fullname':
        case 'full_name':
        case 'name':
            return `${randomElement(FIRST_NAMES)} ${randomElement(LAST_NAMES)}`;
        
        // Contact
        case 'email':
            const emailFirst = randomElement(FIRST_NAMES).toLowerCase();
            const emailLast = randomElement(LAST_NAMES).toLowerCase();
            const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'email.com', 'company.io'];
            return `${emailFirst}.${emailLast}@${randomElement(domains)}`;
        
        case 'phone':
        case 'phonenumber':
        case 'phone_number':
            return `+1 (${randomInt(200, 999)}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`;
        
        // Professional
        case 'company':
        case 'companyname':
        case 'company_name':
            return randomElement(COMPANY_NAMES);
        
        case 'job':
        case 'jobtitle':
        case 'job_title':
        case 'title':
            return randomElement(JOB_TITLES);
        
        // Address
        case 'address':
        case 'streetaddress':
        case 'street_address':
            return `${randomInt(100, 9999)} ${randomElement(STREET_NAMES)}`;
        
        case 'city':
            return randomElement(CITIES);
        
        case 'country':
            return randomElement(COUNTRIES);
        
        case 'zipcode':
        case 'zip_code':
        case 'zip':
            return `${randomInt(10000, 99999)}`;
        
        // Numbers
        case 'number':
        case 'num':
            return `${randomInt(1, 100)}`;
        
        case 'price':
            return `$${randomInt(9, 999)}.${randomInt(0, 99).toString().padStart(2, '0')}`;
        
        case 'percentage':
        case 'percent':
            return `${randomInt(1, 100)}%`;
        
        case 'rating':
            return `${(randomInt(30, 50) / 10).toFixed(1)}`;
        
        // Date & Time
        case 'date':
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${randomElement(months)} ${randomInt(1, 28)}, ${randomInt(2020, 2026)}`;
        
        case 'time':
            const hour = randomInt(1, 12);
            const minute = randomInt(0, 59).toString().padStart(2, '0');
            const ampm = Math.random() > 0.5 ? 'AM' : 'PM';
            return `${hour}:${minute} ${ampm}`;
        
        case 'datetime':
        case 'date_time':
            const dt_months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const dt_hour = randomInt(1, 12);
            const dt_minute = randomInt(0, 59).toString().padStart(2, '0');
            const dt_ampm = Math.random() > 0.5 ? 'AM' : 'PM';
            return `${randomElement(dt_months)} ${randomInt(1, 28)}, ${randomInt(2020, 2026)} at ${dt_hour}:${dt_minute} ${dt_ampm}`;
        
        // Lorem Ipsum
        case 'word':
            return randomElement(LOREM_WORDS);
        
        case 'words':
            return Array.from({ length: randomInt(3, 6) }, () => randomElement(LOREM_WORDS)).join(' ');
        
        case 'sentence':
            const sentenceWords = Array.from({ length: randomInt(8, 15) }, () => randomElement(LOREM_WORDS)).join(' ');
            return sentenceWords.charAt(0).toUpperCase() + sentenceWords.slice(1) + '.';
        
        case 'paragraph':
        case 'para':
            const sentences = Array.from({ length: randomInt(3, 5) }, () => {
                const words = Array.from({ length: randomInt(8, 15) }, () => randomElement(LOREM_WORDS)).join(' ');
                return words.charAt(0).toUpperCase() + words.slice(1) + '.';
            });
            return sentences.join(' ');
        
        // UI specific
        case 'username':
        case 'user_name':
            const userFirst = randomElement(FIRST_NAMES).toLowerCase();
            return `${userFirst}${randomInt(1, 999)}`;
        
        case 'avatar':
        case 'avatar_url':
            return `https://i.pravatar.cc/150?u=${randomInt(1, 1000)}`;
        
        case 'uuid':
        case 'id':
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        
        case 'url':
        case 'website':
            const urlCompany = randomElement(COMPANY_NAMES).toLowerCase().replace(/\s+/g, '');
            const tlds = ['.com', '.io', '.co', '.org', '.net'];
            return `https://www.${urlCompany}${randomElement(tlds)}`;
        
        // Headings / Titles
        case 'heading':
        case 'headline':
            const headingWords = Array.from({ length: randomInt(3, 6) }, () => randomElement(LOREM_WORDS));
            return headingWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        
        case 'short':
        case 'shorttext':
        case 'short_text':
            return Array.from({ length: randomInt(2, 4) }, () => randomElement(LOREM_WORDS)).join(' ');
        
        default:
            // If no match, return the original placeholder text
            return `{{${placeholder}}}`;
    }
}

/**
 * Process text content and replace all {{placeholder}} tokens with fake data
 */
function processFakePlaceholders(text: string): string {
    // Match {{anything}} pattern
    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    
    return text.replace(placeholderRegex, (match, placeholder) => {
        return generateFakeData(placeholder);
    });
}

/**
 * Generate placeholder image URL based on keyword
 */
function getPlaceholderImageUrl(keyword: string, width: number = 400, height: number = 300): string {
    const keywords: Record<string, string> = {
        'avatar': 'portrait,face',
        'hero': 'landscape,nature',
        'product': 'product,minimal',
        'team': 'people,team',
        'office': 'office,workspace',
        'nature': 'nature,landscape',
        'tech': 'technology,computer',
        'food': 'food,restaurant',
        'travel': 'travel,adventure',
        'abstract': 'abstract,pattern'
    };

    const searchTerm = keywords[keyword.toLowerCase()] || keyword;
    return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(searchTerm)}`;
}

/**
 * Map font weight string to Figma font style
 */
function mapFontWeight(weight?: string): string {
    const weightMap: Record<string, string> = {
        'Light': 'Light',
        'Regular': 'Regular',
        'Medium': 'Medium',
        'SemiBold': 'SemiBold',
        'Bold': 'Bold',
        'ExtraBold': 'ExtraBold'
    };
    return weightMap[weight || 'Regular'] || 'Regular';
}

/**
 * Load image from URL and return image hash
 */
async function loadImageFromUrl(url: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;

        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const imageHash = figma.createImage(uint8Array).hash;

        return imageHash;
    } catch (error) {
        console.error('Failed to load image:', error);
        return null;
    }
}

// ============================================================================
// NODE CREATION FUNCTIONS
// ============================================================================

/**
 * Apply common styling properties to a node
 */
function applyCommonStyles(node: SceneNode & MinimalFillsMixin & MinimalBlendMixin, data: NodeData): void {
    // Apply fills
    if (data.fills && data.fills.length > 0) {
        const paints: Paint[] = data.fills.map(fill => {
            if (fill.type === 'SOLID' && fill.color) {
                const rgb = hexToRgb(fill.color);
                return {
                    type: 'SOLID' as const,
                    color: rgb,
                    opacity: fill.opacity ?? hexToAlpha(fill.color)
                };
            }
            return { type: 'SOLID' as const, color: { r: 0.5, g: 0.5, b: 0.5 } };
        });
        node.fills = paints;
    }

    // Apply opacity
    if (data.opacity !== undefined) {
        node.opacity = data.opacity;
    }
}

/**
 * Apply geometry styles (strokes, corners, effects) to a node
 */
function applyGeometryStyles(node: FrameNode | RectangleNode, data: NodeData): void {
    // Apply strokes
    if (data.strokes && data.strokes.length > 0) {
        const strokePaints: Paint[] = data.strokes.map(stroke => {
            const rgb = hexToRgb(stroke.color);
            return {
                type: 'SOLID' as const,
                color: rgb,
                opacity: stroke.opacity ?? 1
            };
        });
        node.strokes = strokePaints;
        node.strokeWeight = data.strokeWeight ?? 1;
        node.strokeAlign = data.strokeAlign ?? 'INSIDE';
    }

    // Apply corner radius
    if (data.cornerRadius !== undefined) {
        node.cornerRadius = data.cornerRadius;
    }

    // Apply individual corner radii
    if (data.topLeftRadius !== undefined) node.topLeftRadius = data.topLeftRadius;
    if (data.topRightRadius !== undefined) node.topRightRadius = data.topRightRadius;
    if (data.bottomLeftRadius !== undefined) node.bottomLeftRadius = data.bottomLeftRadius;
    if (data.bottomRightRadius !== undefined) node.bottomRightRadius = data.bottomRightRadius;

    // Apply effects (shadows, blurs)
    if (data.effects && data.effects.length > 0) {
        const figmaEffects: Effect[] = data.effects.map(effect => {
            if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
                const shadowEffect = effect as ShadowEffect;
                const rgb = hexToRgb(shadowEffect.color);
                const alpha = hexToAlpha(shadowEffect.color);
                return {
                    type: shadowEffect.type,
                    color: { ...rgb, a: alpha },
                    offset: shadowEffect.offset ?? { x: 0, y: 4 },
                    radius: shadowEffect.radius,
                    spread: shadowEffect.spread ?? 0,
                    visible: shadowEffect.visible ?? true,
                    blendMode: 'NORMAL' as const
                };
            } else {
                const blurEffect = effect as BlurEffect;
                return {
                    type: blurEffect.type,
                    radius: blurEffect.radius,
                    visible: blurEffect.visible ?? true
                };
            }
        });
        node.effects = figmaEffects;
    }
}

/**
 * Check if a node is inside an auto-layout parent
 */
function isInAutoLayoutParent(node: SceneNode): boolean {
    const parent = node.parent;
    if (parent && 'layoutMode' in parent) {
        return parent.layoutMode !== 'NONE';
    }
    return false;
}

/**
 * Apply sizing properties to a node
 * Note: FILL sizing only works when node is already appended to an auto-layout parent
 */
function applySizing(node: FrameNode | RectangleNode | TextNode, data: NodeData, isAppended: boolean = false): void {
    const canUseFillHug = isAppended && isInAutoLayoutParent(node);

    // Handle width
    if (data.width === 'fill') {
        if (canUseFillHug && 'layoutSizingHorizontal' in node) {
            node.layoutSizingHorizontal = 'FILL';
        }
    } else if (data.width === 'hug') {
        // HUG can be set on auto-layout frames even without parent
        if ('layoutSizingHorizontal' in node) {
            node.layoutSizingHorizontal = 'HUG';
        }
    } else if (typeof data.width === 'number') {
        if ('resize' in node) {
            node.resize(data.width, node.height);
        }
        if ('layoutSizingHorizontal' in node) {
            node.layoutSizingHorizontal = 'FIXED';
        }
    }

    // Handle height
    if (data.height === 'fill') {
        if (canUseFillHug && 'layoutSizingVertical' in node) {
            node.layoutSizingVertical = 'FILL';
        }
    } else if (data.height === 'hug') {
        // HUG can be set on auto-layout frames even without parent
        if ('layoutSizingVertical' in node) {
            node.layoutSizingVertical = 'HUG';
        }
    } else if (typeof data.height === 'number') {
        if ('resize' in node) {
            node.resize(node.width, data.height);
        }
        if ('layoutSizingVertical' in node) {
            node.layoutSizingVertical = 'FIXED';
        }
    }

    // Apply min/max constraints
    if ('minWidth' in node && data.minWidth !== undefined) {
        node.minWidth = data.minWidth;
    }
    if ('maxWidth' in node && data.maxWidth !== undefined) {
        node.maxWidth = data.maxWidth;
    }
    if ('minHeight' in node && data.minHeight !== undefined) {
        node.minHeight = data.minHeight;
    }
    if ('maxHeight' in node && data.maxHeight !== undefined) {
        node.maxHeight = data.maxHeight;
    }
}

/**
 * Normalize alignment values from CSS-style to Figma API values
 * CSS uses: start, end, flex-start, flex-end, center, baseline, stretch
 * Figma uses: MIN, MAX, CENTER, BASELINE (for counterAxis), SPACE_BETWEEN (for primaryAxis only)
 */
function normalizeAlignmentValue(value: string | undefined, defaultValue: 'MIN' | 'MAX' | 'CENTER' | 'BASELINE' = 'MIN'): 'MIN' | 'MAX' | 'CENTER' | 'BASELINE' {
    if (!value) return defaultValue;
    
    const upperValue = value.toUpperCase().replace(/-/g, '_');
    
    switch (upperValue) {
        case 'MIN':
        case 'START':
        case 'FLEX_START':
            return 'MIN';
        case 'MAX':
        case 'END':
        case 'FLEX_END':
            return 'MAX';
        case 'CENTER':
            return 'CENTER';
        case 'BASELINE':
            return 'BASELINE';
        case 'STRETCH':
            // Stretch is not directly supported in the same way; default to MIN
            return 'MIN';
        default:
            console.warn(`Invalid alignment value "${value}" - defaulting to ${defaultValue}`);
            return defaultValue;
    }
}

/**
 * Normalize primary axis alignment values
 * Figma's primaryAxisAlignItems can be: MIN, MAX, CENTER, SPACE_BETWEEN
 */
function normalizePrimaryAxisAlignment(value: string | undefined, defaultValue: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN' = 'MIN'): 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN' {
    if (!value) return defaultValue;
    
    const upperValue = value.toUpperCase().replace(/-/g, '_');
    
    switch (upperValue) {
        case 'MIN':
        case 'START':
        case 'FLEX_START':
            return 'MIN';
        case 'MAX':
        case 'END':
        case 'FLEX_END':
            return 'MAX';
        case 'CENTER':
            return 'CENTER';
        case 'SPACE_BETWEEN':
            return 'SPACE_BETWEEN';
        default:
            console.warn(`Invalid primary axis alignment "${value}" - defaulting to ${defaultValue}`);
            return defaultValue;
    }
}

/**
 * Create a FRAME node with Auto Layout
 */
async function createFrame(data: NodeData, parent?: FrameNode): Promise<{ node: FrameNode; data: NodeData }> {
    const frame = figma.createFrame();
    frame.name = data.name || 'Frame';

    // Apply Auto Layout (mandatory unless absolute)
    if (!data.absolute) {
        // Validate and auto-correct layoutMode - common AI mistake is using "CENTER"
        let validLayoutMode = data.layoutMode || 'VERTICAL';
        if (validLayoutMode !== 'HORIZONTAL' && validLayoutMode !== 'VERTICAL') {
            console.warn(`Invalid layoutMode "${validLayoutMode}" - defaulting to VERTICAL. Use primaryAxisAlignItems/counterAxisAlignItems for centering.`);
            // If AI mistakenly used CENTER, apply centering to alignment instead
            if ((validLayoutMode as string) === 'CENTER') {
                data.counterAxisAlignItems = data.counterAxisAlignItems || 'CENTER';
                data.primaryAxisAlignItems = data.primaryAxisAlignItems || 'CENTER';
            }
            validLayoutMode = 'VERTICAL';
        }
        frame.layoutMode = validLayoutMode;
        
        // Normalize alignment values from CSS-style to Figma API values
        frame.primaryAxisAlignItems = normalizePrimaryAxisAlignment(data.primaryAxisAlignItems);
        frame.counterAxisAlignItems = normalizeAlignmentValue(data.counterAxisAlignItems);
        frame.itemSpacing = data.itemSpacing ?? 0;

        // Apply padding
        if (data.padding) {
            frame.paddingTop = data.padding.top ?? 0;
            frame.paddingRight = data.padding.right ?? 0;
            frame.paddingBottom = data.padding.bottom ?? 0;
            frame.paddingLeft = data.padding.left ?? 0;
        }

        // Default sizing for auto layout
        frame.primaryAxisSizingMode = data.primaryAxisSizingMode || 'AUTO';
        frame.counterAxisSizingMode = data.counterAxisSizingMode || 'AUTO';
    }

    // Apply common and geometry styles
    applyCommonStyles(frame, data);
    applyGeometryStyles(frame, data);

    // Set initial size if specified (fixed sizes only)
    if (typeof data.width === 'number') {
        frame.resize(data.width, frame.height);
    }
    if (typeof data.height === 'number') {
        frame.resize(frame.width, data.height);
    }

    // Process children recursively
    if (data.children && data.children.length > 0) {
        for (const childData of data.children) {
            const result = await createNodeWithData(childData, frame);
            if (result) {
                // Append child to frame first
                frame.appendChild(result.node);
                
                // Apply layout positioning for absolute children within auto-layout
                if (childData.layoutPositioning === 'ABSOLUTE' && 'layoutPositioning' in result.node) {
                    (result.node as FrameNode).layoutPositioning = 'ABSOLUTE';
                    
                    // Apply constraints if specified
                    if (childData.constraints) {
                        const node = result.node as FrameNode;
                        if (childData.constraints.horizontal) {
                            node.constraints = { 
                                ...node.constraints,
                                horizontal: childData.constraints.horizontal 
                            };
                        }
                        if (childData.constraints.vertical) {
                            node.constraints = { 
                                ...node.constraints,
                                vertical: childData.constraints.vertical 
                            };
                        }
                    }
                    
                    // Apply position for absolute children
                    if (childData.x !== undefined) {
                        result.node.x = childData.x;
                    }
                    if (childData.y !== undefined) {
                        result.node.y = childData.y;
                    }
                } else {
                    // Now apply FILL sizing since node is in auto-layout parent
                    applySizing(result.node as FrameNode | RectangleNode | TextNode, result.data, true);
                }
            }
        }
    }

    // Apply HUG sizing (doesn't require parent) - but NOT fill yet
    if (data.width === 'hug' && 'layoutSizingHorizontal' in frame) {
        frame.layoutSizingHorizontal = 'HUG';
    }
    if (data.height === 'hug' && 'layoutSizingVertical' in frame) {
        frame.layoutSizingVertical = 'HUG';
    }

    // Handle absolute positioning
    if (data.absolute && data.x !== undefined && data.y !== undefined) {
        frame.x = data.x;
        frame.y = data.y;
    }

    return { node: frame, data };
}

/**
 * Create a TEXT node
 */
async function createText(data: NodeData, parent?: FrameNode): Promise<{ node: TextNode; data: NodeData }> {
    const text = figma.createText();
    text.name = data.name || 'Text';

    // Determine font family and style
    const fontFamily = data.fontFamily || 'Inter';
    const fontStyle = mapFontWeight(data.fontWeight);

    // Track which font we actually loaded
    let loadedFont = { family: fontFamily, style: fontStyle };

    // Load font FIRST before any text operations
    try {
        await figma.loadFontAsync({ family: fontFamily, style: fontStyle });
    } catch {
        // Fallback to Inter Regular if requested font isn't available
        try {
            await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
            loadedFont = { family: 'Inter', style: 'Regular' };
        } catch {
            // Last resort fallback
            await figma.loadFontAsync({ family: 'Roboto', style: 'Regular' });
            loadedFont = { family: 'Roboto', style: 'Regular' };
        }
    }

    // Set fontName BEFORE setting characters (required by Figma API)
    text.fontName = loadedFont;

    // Process fake data placeholders and set text content
    const rawText = data.characters || 'Text';
    const processedText = processFakePlaceholders(rawText);
    text.characters = processedText;

    // Apply font size after characters are set
    if (data.fontSize) {
        text.fontSize = data.fontSize;
    }

    // Apply text color
    if (data.textColor) {
        const rgb = hexToRgb(data.textColor);
        text.fills = [{ type: 'SOLID', color: rgb }];
    }

    // Apply text alignment
    if (data.textAlign) {
        text.textAlignHorizontal = data.textAlign;
    }

    // Apply line height
    if (data.lineHeight !== undefined) {
        if (data.lineHeight === 'AUTO') {
            text.lineHeight = { unit: 'AUTO' };
        } else {
            text.lineHeight = { unit: 'PIXELS', value: data.lineHeight };
        }
    }

    // Apply letter spacing
    if (data.letterSpacing !== undefined) {
        text.letterSpacing = { unit: 'PIXELS', value: data.letterSpacing };
    }

    // Apply text decoration
    if (data.textDecoration) {
        text.textDecoration = data.textDecoration;
    }

    // Note: FILL sizing will be applied after appending to parent
    return { node: text, data };
}

/**
 * Create an IMAGE node (rectangle with image fill)
 */
async function createImage(data: NodeData, parent?: FrameNode): Promise<{ node: RectangleNode; data: NodeData }> {
    const rect = figma.createRectangle();
    rect.name = data.name || 'Image';

    // Set initial size
    const width = typeof data.width === 'number' ? data.width : 400;
    const height = typeof data.height === 'number' ? data.height : 300;
    rect.resize(width, height);

    // Apply corner radius
    if (data.cornerRadius !== undefined) {
        rect.cornerRadius = data.cornerRadius;
    }

    // Load and apply image
    if (data.src) {
        let imageUrl = data.src;

        // Check if it's a keyword rather than a URL
        if (!data.src.startsWith('http')) {
            imageUrl = getPlaceholderImageUrl(data.src, width, height);
        }

        const imageHash = await loadImageFromUrl(imageUrl);
        if (imageHash) {
            rect.fills = [{
                type: 'IMAGE',
                imageHash: imageHash,
                scaleMode: 'FILL'
            }];
        } else {
            // Fallback to a solid color if image fails to load
            rect.fills = [{
                type: 'SOLID',
                color: { r: 0.9, g: 0.9, b: 0.9 }
            }];
        }
    }

    // Note: FILL sizing will be applied after appending to parent
    return { node: rect, data };
}

/**
 * Create a RECTANGLE node
 */
function createRectangle(data: NodeData, parent?: FrameNode): { node: RectangleNode; data: NodeData } {
    const rect = figma.createRectangle();
    rect.name = data.name || 'Rectangle';

    // Set initial size
    const width = typeof data.width === 'number' ? data.width : 100;
    const height = typeof data.height === 'number' ? data.height : 100;
    rect.resize(width, height);

    // Apply common and geometry styles
    applyCommonStyles(rect, data);
    applyGeometryStyles(rect, data);

    // Note: FILL sizing will be applied after appending to parent
    return { node: rect, data };
}

/**
 * Create an ICON node using figma.createNodeFromSvg for proper SVG parsing
 */
function createIcon(data: NodeData, parent?: FrameNode): { node: FrameNode; data: NodeData } {
    const iconName = data.icon || 'star';
    const size = data.size || 24;
    const color = data.color || '#000000';
    
    // Get the SVG path data
    const pathData = PHOSPHOR_ICONS[iconName];
    
    if (!pathData) {
        console.warn(`Icon "${iconName}" not found, using star fallback`);
    }
    
    const svgPath = pathData || PHOSPHOR_ICONS['star'];
    
    // Create full SVG markup (Phosphor icons are 256x256 viewBox)
    const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path d="${svgPath}" fill="${color}"/></svg>`;
    
    // Use createNodeFromSvg which properly handles all SVG path commands
    const svgNode = figma.createNodeFromSvg(svgMarkup);
    svgNode.name = data.name || `Icon: ${iconName}`;
    
    // Lock aspect ratio and scale contents by setting constraints
    // This ensures that when we resize the parent frame, the icon vectors scale proportionally
    // instead of being forced into a square bounding box (which causes warping)
    svgNode.children.forEach((child: SceneNode) => {
        if ('constraints' in child) {
            child.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
        }
    });

    // Resize the container frame to the desired size
    svgNode.resize(size, size);
    
    // Apply opacity if specified
    if (data.opacity !== undefined) {
        svgNode.opacity = data.opacity;
    }
    
    return { node: svgNode, data };
}

/**
 * Interface for node creation result
 */
interface NodeResult {
    node: SceneNode;
    data: NodeData;
}

/**
 * Main recursive function to create nodes - returns node with its data
 * for deferred sizing application
 */
async function createNodeWithData(data: NodeData, parent?: FrameNode): Promise<NodeResult | null> {
    switch (data.type) {
        case 'FRAME':
            return await createFrame(data, parent);
        case 'TEXT':
            return await createText(data, parent);
        case 'IMAGE':
            return await createImage(data, parent);
        case 'RECTANGLE':
            return createRectangle(data, parent);
        case 'ICON':
            return createIcon(data, parent);
        default:
            console.warn(`Unknown node type: ${(data as any).type}`);
            return null;
    }
}

/**
 * Create the root node - handles the top-level node that gets added to the page
 */
async function createRootNode(data: NodeData): Promise<SceneNode | null> {
    const result = await createNodeWithData(data);
    if (!result) return null;

    // Root nodes don't need FILL sizing since they're not in an auto-layout parent
    return result.node;
}

// ============================================================================
// SERIALIZATION FUNCTIONS (Figma to JSON)
// ============================================================================

/**
 * Convert RGB color (0-1 range) to hex string
 */
function rgbToHex(color: RGB): string {
    const r = Math.round(color.r * 255).toString(16).padStart(2, '0');
    const g = Math.round(color.g * 255).toString(16).padStart(2, '0');
    const b = Math.round(color.b * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toUpperCase();
}

/**
 * Convert RGBA color to hex string with alpha
 */
function rgbaToHex(color: RGBA): string {
    const r = Math.round(color.r * 255).toString(16).padStart(2, '0');
    const g = Math.round(color.g * 255).toString(16).padStart(2, '0');
    const b = Math.round(color.b * 255).toString(16).padStart(2, '0');
    const a = Math.round(color.a * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}${a}`.toUpperCase();
}

/**
 * Serialize fills array to NodeData format
 */
function serializeFills(fills: readonly Paint[] | typeof figma.mixed): FillStyle[] | undefined {
    if (fills === figma.mixed || !fills || fills.length === 0) {
        return undefined;
    }

    const serialized: FillStyle[] = [];
    for (const fill of fills) {
        if (fill.type === 'SOLID') {
            serialized.push({
                type: 'SOLID',
                color: rgbToHex(fill.color),
                opacity: fill.opacity
            });
        } else if (fill.type === 'GRADIENT_LINEAR' || fill.type === 'GRADIENT_RADIAL') {
            // Simplified gradient - just note the type
            serialized.push({
                type: fill.type as 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL',
                color: '#888888', // Placeholder
                opacity: fill.opacity
            });
        }
        // Skip IMAGE fills - they cannot be easily serialized
    }
    return serialized.length > 0 ? serialized : undefined;
}

/**
 * Serialize strokes array to NodeData format
 */
function serializeStrokes(strokes: readonly Paint[] | typeof figma.mixed): StrokeStyle[] | undefined {
    if (strokes === figma.mixed || !strokes || strokes.length === 0) {
        return undefined;
    }

    const serialized: StrokeStyle[] = [];
    for (const stroke of strokes) {
        if (stroke.type === 'SOLID') {
            serialized.push({
                type: 'SOLID',
                color: rgbToHex(stroke.color),
                opacity: stroke.opacity
            });
        }
    }
    return serialized.length > 0 ? serialized : undefined;
}

/**
 * Serialize effects array to NodeData format
 */
function serializeEffects(effects: readonly Effect[]): EffectStyle[] | undefined {
    if (!effects || effects.length === 0) {
        return undefined;
    }

    const serialized: EffectStyle[] = [];
    for (const effect of effects) {
        if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
            serialized.push({
                type: effect.type,
                color: rgbaToHex(effect.color),
                offset: effect.offset,
                radius: effect.radius,
                spread: effect.spread,
                visible: effect.visible
            });
        } else if (effect.type === 'LAYER_BLUR' || effect.type === 'BACKGROUND_BLUR') {
            serialized.push({
                type: effect.type,
                radius: effect.radius,
                visible: effect.visible
            });
        }
    }
    return serialized.length > 0 ? serialized : undefined;
}

/**
 * Detect if a frame is likely a Phosphor icon by checking structure and name
 */
function detectIconFromFrame(node: FrameNode): string | null {
    // Check if name suggests it's an icon
    if (node.name.toLowerCase().includes('icon:')) {
        const iconName = node.name.split(':')[1]?.trim().toLowerCase();
        if (iconName && PHOSPHOR_ICONS[iconName]) {
            return iconName;
        }
    }
    return null;
}

/**
 * Get color from a node's fills if it's a solid color
 */
function getColorFromFills(fills: readonly Paint[] | typeof figma.mixed): string | undefined {
    if (fills === figma.mixed || !fills || fills.length === 0) {
        return undefined;
    }
    
    for (const fill of fills) {
        if (fill.type === 'SOLID') {
            return rgbToHex(fill.color);
        }
    }
    return undefined;
}

/**
 * Check if fills contain an image
 */
function hasImageFill(fills: readonly Paint[] | typeof figma.mixed): boolean {
    if (fills === figma.mixed || !fills) return false;
    return fills.some(fill => fill.type === 'IMAGE');
}

/**
 * Serialize a Figma node to NodeData format
 */
function serializeNode(node: SceneNode): NodeData | null {
    // Skip hidden nodes
    if (!node.visible) {
        return null;
    }

    // Handle FRAME nodes
    if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') {
        const frame = node as FrameNode;
        
        // Check if this is an icon
        const iconName = detectIconFromFrame(frame);
        if (iconName) {
            // Get color from the first vector child
            let iconColor = '#000000';
            if (frame.children.length > 0) {
                const firstChild = frame.children[0];
                if ('fills' in firstChild) {
                    iconColor = getColorFromFills(firstChild.fills as readonly Paint[]) || iconColor;
                }
            }
            
            return {
                type: 'ICON',
                name: frame.name,
                icon: iconName,
                size: Math.round(frame.width),
                color: iconColor
            };
        }

        const nodeData: NodeData = {
            type: 'FRAME',
            name: frame.name
        };

        // Layout mode
        if (frame.layoutMode && frame.layoutMode !== 'NONE') {
            nodeData.layoutMode = frame.layoutMode;
            nodeData.primaryAxisAlignItems = frame.primaryAxisAlignItems;
            nodeData.counterAxisAlignItems = frame.counterAxisAlignItems;
            
            if (frame.itemSpacing > 0) {
                nodeData.itemSpacing = Math.round(frame.itemSpacing);
            }
            
            // Padding
            const hasPadding = frame.paddingTop > 0 || frame.paddingRight > 0 || 
                               frame.paddingBottom > 0 || frame.paddingLeft > 0;
            if (hasPadding) {
                nodeData.padding = {
                    top: Math.round(frame.paddingTop),
                    right: Math.round(frame.paddingRight),
                    bottom: Math.round(frame.paddingBottom),
                    left: Math.round(frame.paddingLeft)
                };
            }
        }

        // Size
        if (frame.layoutSizingHorizontal === 'FILL') {
            nodeData.width = 'fill';
        } else if (frame.layoutSizingHorizontal === 'HUG') {
            nodeData.width = 'hug';
        } else {
            nodeData.width = Math.round(frame.width);
        }

        if (frame.layoutSizingVertical === 'FILL') {
            nodeData.height = 'fill';
        } else if (frame.layoutSizingVertical === 'HUG') {
            nodeData.height = 'hug';
        } else {
            nodeData.height = Math.round(frame.height);
        }

        // Styling
        const fills = serializeFills(frame.fills);
        if (fills) nodeData.fills = fills;

        const strokes = serializeStrokes(frame.strokes);
        if (strokes) {
            nodeData.strokes = strokes;
            if (frame.strokeWeight && frame.strokeWeight !== figma.mixed) {
                nodeData.strokeWeight = frame.strokeWeight;
            }
        }

        // Corner radius
        if (typeof frame.cornerRadius === 'number' && frame.cornerRadius > 0) {
            nodeData.cornerRadius = Math.round(frame.cornerRadius);
        } else if (frame.cornerRadius === figma.mixed) {
            // Use individual radii
            if (frame.topLeftRadius > 0) nodeData.topLeftRadius = Math.round(frame.topLeftRadius);
            if (frame.topRightRadius > 0) nodeData.topRightRadius = Math.round(frame.topRightRadius);
            if (frame.bottomLeftRadius > 0) nodeData.bottomLeftRadius = Math.round(frame.bottomLeftRadius);
            if (frame.bottomRightRadius > 0) nodeData.bottomRightRadius = Math.round(frame.bottomRightRadius);
        }

        // Effects
        const effects = serializeEffects(frame.effects);
        if (effects) nodeData.effects = effects;

        // Opacity
        if (frame.opacity < 1) {
            nodeData.opacity = frame.opacity;
        }

        // Children
        if (frame.children && frame.children.length > 0) {
            const children: NodeData[] = [];
            for (const child of frame.children) {
                const serializedChild = serializeNode(child);
                if (serializedChild) {
                    children.push(serializedChild);
                }
            }
            if (children.length > 0) {
                nodeData.children = children;
            }
        }

        return nodeData;
    }

    // Handle TEXT nodes
    if (node.type === 'TEXT') {
        const text = node as TextNode;
        
        const nodeData: NodeData = {
            type: 'TEXT',
            name: text.name,
            characters: text.characters
        };

        // Font properties
        if (text.fontSize !== figma.mixed) {
            nodeData.fontSize = text.fontSize as number;
        }

        if (text.fontName !== figma.mixed) {
            const fontName = text.fontName as FontName;
            nodeData.fontFamily = fontName.family;
            nodeData.fontWeight = fontName.style as any;
        }

        // Text color
        const fills = text.fills;
        if (fills !== figma.mixed && fills.length > 0) {
            const firstFill = fills[0];
            if (firstFill.type === 'SOLID') {
                nodeData.textColor = rgbToHex(firstFill.color);
            }
        }

        // Text alignment
        if (text.textAlignHorizontal && text.textAlignHorizontal !== 'LEFT') {
            nodeData.textAlign = text.textAlignHorizontal as 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
        }

        // Line height
        if (text.lineHeight !== figma.mixed) {
            const lineHeight = text.lineHeight as LineHeight;
            if (lineHeight.unit === 'AUTO') {
                nodeData.lineHeight = 'AUTO';
            } else if (lineHeight.unit === 'PIXELS') {
                nodeData.lineHeight = lineHeight.value;
            }
        }

        // Size for text
        if (text.layoutSizingHorizontal === 'FILL') {
            nodeData.width = 'fill';
        }

        return nodeData;
    }

    // Handle RECTANGLE nodes
    if (node.type === 'RECTANGLE') {
        const rect = node as RectangleNode;
        
        // Check if it's an image (has image fill)
        if (hasImageFill(rect.fills)) {
            const nodeData: NodeData = {
                type: 'IMAGE',
                name: rect.name,
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                src: 'placeholder' // We can't extract the actual image URL
            };

            if (typeof rect.cornerRadius === 'number' && rect.cornerRadius > 0) {
                nodeData.cornerRadius = Math.round(rect.cornerRadius);
            }

            return nodeData;
        }

        // Regular rectangle
        const nodeData: NodeData = {
            type: 'RECTANGLE',
            name: rect.name,
            width: Math.round(rect.width),
            height: Math.round(rect.height)
        };

        const fills = serializeFills(rect.fills);
        if (fills) nodeData.fills = fills;

        const strokes = serializeStrokes(rect.strokes);
        if (strokes) {
            nodeData.strokes = strokes;
            if (rect.strokeWeight && rect.strokeWeight !== figma.mixed) {
                nodeData.strokeWeight = rect.strokeWeight;
            }
        }

        if (typeof rect.cornerRadius === 'number' && rect.cornerRadius > 0) {
            nodeData.cornerRadius = Math.round(rect.cornerRadius);
        }

        const effects = serializeEffects(rect.effects);
        if (effects) nodeData.effects = effects;

        if (rect.opacity < 1) {
            nodeData.opacity = rect.opacity;
        }

        return nodeData;
    }

    // Handle ELLIPSE nodes
    if (node.type === 'ELLIPSE') {
        const ellipse = node as EllipseNode;
        
        const nodeData: NodeData = {
            type: 'RECTANGLE', // Treat as rectangle for simplicity
            name: ellipse.name,
            width: Math.round(ellipse.width),
            height: Math.round(ellipse.height),
            cornerRadius: Math.round(Math.min(ellipse.width, ellipse.height) / 2) // Make it circular
        };

        const fills = serializeFills(ellipse.fills);
        if (fills) nodeData.fills = fills;

        return nodeData;
    }

    // Handle VECTOR nodes (attempt to identify icons)
    if (node.type === 'VECTOR') {
        const vector = node as VectorNode;
        
        const nodeData: NodeData = {
            type: 'RECTANGLE',
            name: vector.name,
            width: Math.round(vector.width),
            height: Math.round(vector.height)
        };

        const fills = serializeFills(vector.fills);
        if (fills) nodeData.fills = fills;

        return nodeData;
    }

    // Handle GROUP nodes
    if (node.type === 'GROUP') {
        const group = node as GroupNode;
        
        const nodeData: NodeData = {
            type: 'FRAME',
            name: group.name,
            width: Math.round(group.width),
            height: Math.round(group.height)
        };

        if (group.children && group.children.length > 0) {
            const children: NodeData[] = [];
            for (const child of group.children) {
                const serializedChild = serializeNode(child);
                if (serializedChild) {
                    children.push(serializedChild);
                }
            }
            if (children.length > 0) {
                nodeData.children = children;
            }
        }

        return nodeData;
    }

    // Skip unsupported node types
    console.warn(`Unsupported node type: ${node.type}`);
    return null;
}

/**
 * Count total nodes in serialized data
 */
function countSerializedNodes(data: NodeData): number {
    let count = 1;
    if (data.children) {
        for (const child of data.children) {
            count += countSerializedNodes(child);
        }
    }
    return count;
}

// ============================================================================
// PLUGIN INITIALIZATION
// ============================================================================

// Show the plugin UI
figma.showUI(__html__, {
    width: 420,
    height: 600,
    themeColors: true
});

// Handle messages from the UI
figma.ui.onmessage = async (msg: { type: string; data?: NodeData }) => {
    if (msg.type === 'build' && msg.data) {
        try {
            // Start building the design
            const rootNode = await createRootNode(msg.data);

            if (rootNode) {
                // Position at center of viewport
                const viewportCenter = figma.viewport.center;
                rootNode.x = viewportCenter.x - rootNode.width / 2;
                rootNode.y = viewportCenter.y - rootNode.height / 2;

                // Append to current page
                figma.currentPage.appendChild(rootNode);

                // Select the created node and zoom to it
                figma.currentPage.selection = [rootNode];
                figma.viewport.scrollAndZoomIntoView([rootNode]);

                // Send success message
                figma.ui.postMessage({
                    type: 'success',
                    message: `✨ Design created successfully! ${countNodes(msg.data)} nodes generated.`
                });
            } else {
                figma.ui.postMessage({
                    type: 'error',
                    message: 'Failed to create the design. Please check your JSON structure.'
                });
            }
        } catch (error) {
            console.error('Build error:', error);
            figma.ui.postMessage({
                type: 'error',
                message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    }
    
    // Handle export requests
    if (msg.type === 'export') {
        try {
            const selection = figma.currentPage.selection;
            
            if (selection.length === 0) {
                figma.ui.postMessage({
                    type: 'export-error',
                    message: 'Please select a frame to export.'
                });
                return;
            }

            const selectedNode = selection[0];
            
            // Validate that we have a frame-like node
            if (selectedNode.type !== 'FRAME' && 
                selectedNode.type !== 'COMPONENT' && 
                selectedNode.type !== 'INSTANCE' &&
                selectedNode.type !== 'GROUP') {
                figma.ui.postMessage({
                    type: 'export-error',
                    message: 'Please select a Frame, Component, or Group to export.'
                });
                return;
            }

            // Serialize the selected node
            const serializedData = serializeNode(selectedNode);
            
            if (serializedData) {
                const nodeCount = countSerializedNodes(serializedData);
                figma.ui.postMessage({
                    type: 'export-success',
                    json: JSON.stringify(serializedData, null, 2),
                    message: `✨ Exported successfully! ${nodeCount} nodes serialized.`
                });
            } else {
                figma.ui.postMessage({
                    type: 'export-error',
                    message: 'Failed to serialize the selected node.'
                });
            }
        } catch (error) {
            console.error('Export error:', error);
            figma.ui.postMessage({
                type: 'export-error',
                message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    }
};

/**
 * Count total nodes in the design
 */
function countNodes(data: NodeData): number {
    let count = 1;
    if (data.children) {
        for (const child of data.children) {
            count += countNodes(child);
        }
    }
    return count;
}
