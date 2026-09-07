import { useState, useEffect } from "react";
import "../styles/App.css";

type Mode = "encrypt" | "decrypt";
type ResourceType = "text" | "file" | "image" | "audio" | "video" | "folder";

type AlgorithmCategory = {
    id: string;
    icon: string;
    name: string;
    description: string;
    algorithms: Algorithm[];
};
type Algorithm = {
    id: string;
    name: string;
    description: string;
    icon: string;
    badge: string;
    badgeType: "recommended" | "default";
    keyType: "password" | "keypair";
    operation: "encryption" | "key-exchange";
    supports: ResourceType[];
};


const algorithmCategories: Record<string, AlgorithmCategory> = {
    symmetric: {
        id: "symmetric",
        icon: "◈",
        name: "Symmetric Encryption",
        description: "Shared-key encryption for your data",
        algorithms: [
            {
                id: "AES-256-GCM",
                name: "AES-256-GCM",
                description: "Strong & recommended",
                icon: "🔐",
                badge: "RECOMMENDED",
                badgeType: "recommended",
                keyType: "password",
                operation: "encryption",
                supports: ["text", "file", "image", "audio", "video", "folder"]
            },

            {
                id: "AES-256-CBC",
                name: "AES-256-CBC",
                description: "Strong & compatible",
                icon: "🔒",
                badge: "COMPATIBLE",
                badgeType: "default",
                keyType: "password",
                operation: "encryption",
                supports: ["text", "file", "image", "audio", "video", "folder"]
            },

            {
                id: "AES-128-GCM",
                name: "AES-128-GCM",
                description: "Fast & secure",
                icon: "⚡",
                badge: "FAST",
                badgeType: "default",
                keyType: "password",
                operation: "encryption",
                supports: ["text", "file", "image", "audio", "video", "folder"],
            },

            {
                id: "ChaCha20-Poly1305",
                name: "ChaCha20-Poly1305",
                description: "Fast & modern",
                icon: "⚡",
                badge: "MODERN",
                badgeType: "default",
                keyType: "password",
                operation: "encryption",
                supports: ["text", "file", "image", "audio", "video", "folder"],
            },

            {
                id: "XChaCha20-Poly1305",
                name: "XChaCha20-Poly1305",
                description: "Strong & flexible",
                icon: "🛡️",
                badge: "ADVANCED",
                badgeType: "default",
                keyType: "password",
                operation: "encryption",
                supports: ["text", "file", "image", "audio", "video", "folder"]
            },
        ] satisfies Algorithm[],
    },

    publicKey: {
        id: "public-key",
        icon: "◇",
        name: "Public-Key Encryption",
        description: "Encryption using key pairs",
        algorithms: [
            {
                id: "RSA-2048",
                name: "RSA-2048",
                description: "Secure & widely supported",
                icon: "🔑",
                badge: "STANDARD",
                badgeType: "default",
                keyType: "keypair",
                operation: "encryption",
                supports: ["text"],
            },

            {
                id: "RSA-3072",
                name: "RSA-3072",
                description: "Stronger protection",
                icon: "🛡️",
                badge: "STRONG",
                badgeType: "default",
                keyType: "keypair",
                operation: "encryption",
                supports: ["text"],
            },

            {
                id: "RSA-4096",
                name: "RSA-4096",
                description: "Maximum RSA strength",
                icon: "🛡️",
                badge: "HIGH SECURITY",
                badgeType: "default",
                keyType: "keypair",
                operation: "encryption",
                supports: ["text"],
            },
        ] satisfies Algorithm[],
    },

    keyExchange: {
        id: "key-exchange",
        icon: "⇄",
        name: "Key Exchange",
        description: "Establish secure shared secrets",
        algorithms: [
            {
                id: "ECDH",
                name: "ECDH",
                description: "Secure key exchange",
                icon: "🔑",
                badge: "SECURE",
                badgeType: "default",
                keyType: "keypair",
                operation: "key-exchange",
                supports: [],
            },

            {
                id: "X25519",
                name: "X25519",
                description: "Fast & modern key exchange",
                icon: "⚡",
                badge: "MODERN",
                badgeType: "default",
                keyType: "keypair",
                operation: "key-exchange",
                supports: [],
            },
        ] satisfies Algorithm[],
    },
};

const resourceTypes: Record<ResourceType,
    {
        name: string;
        description: string;
        icon: string;
    }
> = {
    text: {
        name: "Text",
        description: "Messages, notes and other text",
        icon: "📝",
    },
    file: {
        name: "File",
        description: "Documents and other files",
        icon: "📄",
    },
    image: {
        name: "Image",
        description: "Photos and other images",
        icon: "📸",
    },
    audio: {
        name: "Audio",
        description: "Music, recordings and audio",
        icon: "🔊",
    },
    video: {
        name: "Video",
        description: "Videos and recordings",
        icon: "🎬",
    },
    folder: {
        name: "Folder",
        description: "Protect an entire folder",
        icon: "📁",
    },
};

function App() {
    const [mode, setMode] = useState<Mode>("encrypt");
    const [selectedResource, setSelectedResource] = useState<ResourceType>("text");
    const [selectedAlgorithm, setSelectedAlgorithm] = useState("AES-256-GCM");
    const [openCategory, setOpenCategory] = useState<string | null>("symmetric");
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState(0);
    const [operationComplete, setOperationComplete] = useState(false);
    const [operationResult, setOperationResult] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [downloaded, setDownloaded] = useState(false);

    const selectedAlgorithmConfig =
        Object.values(algorithmCategories)
            .flatMap(category => category.algorithms)
            .find(algorithm => algorithm.id === selectedAlgorithm);

    const availableAlgorithms = Object.values(algorithmCategories)
        .flatMap(category => category.algorithms)
        .filter(algorithm =>
            algorithm.supports.includes(selectedResource)
        );

    useEffect(() => {
        const isCurrentAlgorithmAvailable =
            availableAlgorithms.some(algorithm => algorithm.id === selectedAlgorithm);

        if (!isCurrentAlgorithmAvailable && availableAlgorithms.length > 0) {
            const recommendedAlgorithm = availableAlgorithms.find(algorithm => algorithm.badgeType === "recommended"
            );

            setSelectedAlgorithm(recommendedAlgorithm?.id ?? availableAlgorithms[0].id);
        }
    }, [selectedResource, availableAlgorithms, selectedAlgorithm,]
    );

    const processingSteps = mode === "encrypt"
        ? [
            "Preparing resource",
            "Generating secure parameters",
            "Deriving encryption key",
            "Encrypting resource",
            "Authenticating encrypted data",
        ]
        : [
            "Reading encrypted resource",
            "Verifying encrypted data",
            "Deriving decryption key",
            "Decrypting resource",
            "Restoring original resource",
        ];

    return (
        <div className="app">
            <header className="navbar">
                <div className="brand">
                    <div className="brand-icon">◈</div>
                    <div>
                        <h1>LockBox</h1>
                        <span>CRYPTOGRAPHIC WORKSPACE</span>
                    </div>
                </div>
                <nav>
                    <button className="nav-link active">Workspace</button>
                    <button className="nav-link">Tools</button>
                    <button className="nav-link">About</button>
                </nav>
                <div className="security-status">
                    <span className="status-dot"></span>SECURITY MADE EASY
                </div>
            </header>
            <main className="workspace">
                <section className="intro">
                    <div className="eyebrow">
                        <span>01</span> SECURE YOUR DATA
                    </div>
                    <h2>Your Data <br /> <span>Your Control</span></h2>
                    <p>Encrypt text,files, images, audio,videos and folders directly from your workspace</p>
                </section>

                <section className="crypto-workspace">
                    <div className="mode-selector">
                        <button
                            className={mode === "encrypt" ? "mode active" : "mode"}
                            onClick={() => setMode("encrypt")} >
                            <span className="mode-icon">🔒</span>
                            <div>
                                <strong>Encrypt</strong>
                                <small>Protect your resource</small>
                            </div>
                        </button>
                        <button
                            className={mode === "decrypt" ? "mode active" : "mode"}
                            onClick={() => setMode("decrypt")}>
                            <span className="mode-icon">🔓</span>
                            <div>
                                <strong>Decrypt</strong>
                                <small>Restore a resource</small>
                            </div>
                        </button>
                    </div>
                    <div className="workspace-grid">
                        <section className="panel resource-panel">
                            <div className="panel-header">
                                <div>
                                    <span className="panel-number">01</span>
                                    <h3>Resource</h3>
                                </div>
                                <span className="panel-label">
                                    {mode === "encrypt" ? "INPUT" : "ENCRYPTED INPUT"}
                                </span>
                            </div>
                            <label className="field-label">
                                {mode === "encrypt" ? "What would you like to secure?" : "What would you like unlocked?"}
                            </label>

                            <div className="resource-grid">
                                {(
                                    Object.entries(resourceTypes) as [
                                        ResourceType,
                                        typeof resourceTypes[ResourceType]
                                    ][]
                                ).map(([type, resource]) => {
                                    const isSelected = selectedResource === type;

                                    return (
                                        <button
                                            key={type}
                                            type="button"
                                            className={`resource-card ${isSelected ? "selected" : ""}`}
                                            onClick={() => setSelectedResource(type)}
                                        >
                                            <span className="resource-icon">{resource.icon}</span>

                                            <span className="resource-info">
                                                <strong>{resource.name}</strong>
                                                <small>{resource.description}</small>
                                            </span>

                                            {isSelected && (<span className="resource-check">✓ </span>)}
                                        </button>
                                    );
                                })}
                            </div>

                            {selectedResource === "text" ? (
                                <textarea className="text-input"
                                    placeholder={mode === "encrypt" ? "Enter the text you want secured..." : "Paste your encrypted text here..."}
                                ></textarea>
                            ) : (
                                <div className="drop-zone">
                                    <div className="upload-icon">↑</div>
                                    <strong>Drop your {selectedResource} here</strong>
                                    <span>or click to browse your device</span>
                                    <button className="browse-button">Browse files</button>
                                </div>
                            )}
                        </section>

                        <section className="panel crypto-panel">
                            <div className="panel-header">
                                <div>
                                    <span className="panel-number">02</span>
                                    <h3>Cryptography</h3>
                                </div>
                                <span className="panel-label">CONFIG</span>
                            </div>
                            <label className="field-label">
                                Encryption algorithm
                            </label>

                            <div className="algorithm-catalog">

                                {Object.values(algorithmCategories).map((category) => {
                                    const isOpen = openCategory === category.id;

                                    return (
                                        <div className="algorithm-category" key={category.id}>
                                            <button
                                                className={`category-header ${isOpen ? "open" : ""}`}
                                                onClick={() => setOpenCategory(isOpen ? null : category.id)}
                                            >
                                                <div className="category-title">
                                                    <div className="category-icon">{category.icon}</div>
                                                    <div>
                                                        <strong>{category.name}</strong>
                                                        <span>{category.description}</span>
                                                    </div>
                                                </div>

                                                <div className="category-right">
                                                    <span className="algorithm-count">
                                                        {category.algorithms.length}{" "}
                                                        {category.algorithms.length === 1 ? "METHOD" : "METHODS"}
                                                    </span>
                                                    <span className="category-chevron">{isOpen ? "-" : "+"}</span>
                                                </div>

                                            </button>

                                            {isOpen && (
                                                <div className="algorithm-options">
                                                    {category.algorithms.map((algorithm) => {
                                                        const isSupported = availableAlgorithms.some(
                                                            available => available.id === algorithm.id
                                                        );

                                                        return (
                                                            <button
                                                                key={algorithm.id}
                                                                className={`algorithm-card ${selectedAlgorithm === algorithm.id ? "selected" : ""} ${!isSupported ? "disabled" : ""}`}
                                                                onClick={() => { if (isSupported) setSelectedAlgorithm(algorithm.id); }}
                                                            >
                                                                <div className="algorithm-icon">{algorithm.icon}</div>

                                                                <div className="algorithm-info">
                                                                    <strong>{algorithm.name}</strong>
                                                                    <span>{algorithm.description}</span>
                                                                </div>
                                                                {!isSupported && (
                                                                    <span className="unsupported-reason">
                                                                        Not suitable for {resourceTypes[selectedResource].name}
                                                                    </span>
                                                                )}
                                                                <div className={`algorithm-badge ${algorithm.badgeType === "recommended" ? "recommended" : ""}`}>
                                                                    {algorithm.badge}
                                                                </div>
                                                            </button>
                                                        );
                                                    }
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                                )}
                            </div>
                            {selectedAlgorithmConfig?.keyType === "password" && (
                                <>
                                    <label className="field-label key-label">
                                        {mode === "encrypt" ? "Encryption password" : "Decryption password"}
                                    </label>

                                    <div className="password-input">
                                        <input type="password" placeholder="Enter your secret key" />
                                        <button type="button">◉</button>
                                    </div>
                                    <div className="security-note">
                                        <span>✓</span> Your encryption key is processed locally
                                    </div>
                                </>
                            )}
                            {selectedAlgorithmConfig?.keyType === "keypair" &&
                                selectedAlgorithmConfig?.operation === "encryption" && (
                                    <div className="keypair-section">
                                        <div className="keypair-header">
                                            <div>
                                                <strong>Encryption key pair</strong>
                                                <span>Use a public key to protect your resource</span>
                                            </div>
                                            <span className="keypair-icon">🔑</span>
                                        </div>

                                        <label className="field-label">Public key</label>

                                        <div className="key-input">
                                            <textarea placeholder="Paste your public key here..." rows={4} />
                                        </div>

                                        <button type="button" className="secondary-action">⚙ Generate Key Pair</button>

                                        <div className="security-note">
                                            <span>✓</span>
                                            Your private key remains on your device
                                        </div>

                                    </div>
                                )}
                            {selectedAlgorithmConfig?.operation === "key-exchange" && (
                                <div className="key-exchange-section">
                                    <div className="keypair-header">
                                        <div>
                                            <strong>Secure key exchange</strong>
                                            <span>Establish a shared secret securely</span>
                                        </div>

                                        <span className="keypair-icon">⇄</span>
                                    </div>

                                    <div className="exchange-info">
                                        <div className="exchange-step">
                                            <span>01</span>
                                            <div>
                                                <strong>Generate key pair</strong>
                                                <small> Create your private and public keys</small>
                                            </div>
                                        </div>

                                        <div className="exchange-line" />

                                        <div className="exchange-step">
                                            <span>02</span>
                                            <div>
                                                <strong>Share public key</strong>
                                                <small>Your private key stays secret</small>
                                            </div>
                                        </div>
                                        <div className="exchange-line" />
                                        <div className="exchange-step">
                                            <span>03</span>
                                            <div>
                                                <strong>Establish shared secret</strong>
                                                <small>Both parties derive the same secret</small>
                                            </div>
                                        </div>
                                    </div>

                                    <button type="button" className="secondary-action">🔑 Generate Key Pair</button>
                                </div>
                            )}
                            {selectedAlgorithmConfig?.operation === "encryption" && (
                                <>
                                    {isProcessing ? (
                                        <div className="processing-panel">
                                            <div className="processing-icon">◈</div>
                                            <div className="processing-title">
                                                {mode === "encrypt" ? "SECURING RESOURCE" : "RESTORING RESOURCE"}
                                            </div>
                                            <div className="processing-description">
                                                {processingSteps[processingStep]}...
                                            </div>

                                            <div className="processing-bar">
                                                <div
                                                    className="processing-progress"
                                                    style={{ width: `${((processingStep + 1) / processingSteps.length) * 100}%`, }}
                                                />
                                            </div>
                                            <div className="processing-steps">
                                                {processingSteps.map((step, index) => (
                                                    <div
                                                        key={step}
                                                        className={
                                                            index < processingStep
                                                                ? "complete"
                                                                : index === processingStep
                                                                    ? "active"
                                                                    : ""
                                                        }
                                                    >
                                                        <span>
                                                            {index < processingStep
                                                                ? "✓"
                                                                : index === processingStep
                                                                    ? "●"
                                                                    : "○"}
                                                        </span>
                                                        {step}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="processing-meta">
                                                <span>{selectedAlgorithm}</span>
                                                <span>LOCAL PROCESSING</span>
                                            </div>

                                        </div>
                                    ) : operationComplete ? (
                                        <div className="completion-panel">

                                            <div className="completion-icon">✓</div>

                                            <div className="completion-title">
                                                {mode === "encrypt" ? "ENCRYPTION COMPLETE" : "DECRYPTION COMPLETE"}
                                            </div>
                                            <div className="completion-description">
                                                {mode === "encrypt" ? "Your resource has been successfully secured." : "Your resource has been successfully restored."}
                                            </div>
                                            {operationResult && (
                                                <div className="result-container">
                                                    <div className="result-header">
                                                        <span>ENCRYPTED RESOURCE</span>
                                                        <span>{selectedAlgorithm}</span>
                                                    </div>
                                                    <div className="result-box">
                                                        {operationResult}
                                                    </div>
                                                    <div className="result-actions">
                                                        <button
                                                            className={`result-action ${copied ? "done" : ""}`}
                                                            onClick={async () => {
                                                                if (!operationResult) return;

                                                                await navigator.clipboard.writeText(operationResult);

                                                                setCopied(true);

                                                                setTimeout(() => {
                                                                    setCopied(false);
                                                                }, 3000);
                                                            }}
                                                        >
                                                            {copied ? "✓ Copied" : "⧉ Copy"}
                                                        </button>

                                                        <button
                                                            className={`result-action ${downloaded ? "done" : ""}`}
                                                            onClick={() => {
                                                                const blob = new Blob([operationResult], { type: "text/plain" });
                                                                const url = URL.createObjectURL(blob);
                                                                const link = document.createElement("a");
                                                                link.href = url;
                                                                link.download = "lockbox-encrypted.txt";
                                                                link.click();

                                                                URL.revokeObjectURL(url);
                                                                setDownloaded(true);

                                                                setTimeout(() => {
                                                                    setDownloaded(false);
                                                                }, 3000);
                                                            }}
                                                        >
                                                            {downloaded ? "✓ Downloaded" : "↓ Download"}
                                                        </button>
                                                    </div>

                                                </div>
                                            )}
                                            <div className="completion-meta">
                                                <span>{selectedAlgorithm}</span>
                                                <span>LOCAL PROCESSING</span>
                                            </div>

                                            <button
                                                className="primary-action"
                                                onClick={() => { setOperationComplete(false); }}
                                            >
                                                <span>↻</span>
                                                {mode === "encrypt" ? "Encrypt Another Resource" : "Decrypt Another Resource"}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            className="primary-action"
                                            disabled={isProcessing}
                                            onClick={() => {
                                                setCopied(false);
                                                setDownloaded(false);
                                                setOperationResult(null);
                                                setOperationComplete(false);
                                                setIsProcessing(true);
                                                setProcessingStep(0);

                                                let step = 0;
                                                const interval = setInterval(() => {
                                                    step++;
                                                    if (step >= processingSteps.length) {
                                                        clearInterval(interval);
                                                        setIsProcessing(false);
                                                        setOperationComplete(true);
                                                        setOperationResult("LBX1:AES256GCM:ENCRYPTED_RESOURCE_PREVIEW");
                                                        return;
                                                    }

                                                    setProcessingStep(step);
                                                }, 800);
                                            }}
                                        >
                                            <span>
                                                {mode === "encrypt" ? "🔒" : "🔓"}
                                            </span>

                                            {mode === "encrypt"
                                                ? "Encrypt Resource"
                                                : "Decrypt Resource"}
                                        </button>
                                    )}
                                </>
                            )}
                        </section>
                    </div>
                    <section className="activity-panel">
                        <div className="activity-heading">
                            <span className="activity-dot" />
                            <div>
                                <strong>Cryptographic Engine</strong>
                                <span>READY</span>
                            </div>
                        </div>
                        <div className="activity-flow">
                            <span>RESOURCE</span>
                            <i>→</i>
                            <span>KEY DERIVATION</span>
                            <i>→</i>
                            <span>AES-256-GCM</span>
                            <i>→</i>
                            <span>AUTHENTICATION</span>
                            <i>→</i>
                            <strong>{mode === "encrypt" ? "ENCRYPTED" : "DECRYPTED"}</strong>
                        </div>
                    </section>
                </section>
            </main>
            <footer>
                <span>LockBox v0.1</span>
                <span>CLIENT SIDE CRYPTOGRAPHY</span>
                <span>● SYSTEM READY</span>
            </footer>
        </div>
    )
}

export default App;