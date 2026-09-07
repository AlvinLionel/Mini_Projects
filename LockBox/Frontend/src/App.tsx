import { useState } from "react";
import "../styles/App.css";

type Mode = "encrypt" | "decrypt";
type ResourceType = "text" | "file" | "image" | "audio" | "video" | "folder";

const algorithmCategories = {
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
            },
            {
                id: "AES-256-CBC",
                name: "AES-256-CBC",
                description: "Strong & compatible",
                icon: "🔒",
                badge: "COMPATIBLE",
                badgeType: "default",
            },
            {
                id: "AES-128-GCM",
                name: "AES-128-GCM",
                description: "Fast & secure",
                icon: "⚡",
                badge: "FAST",
                badgeType: "default",
            },
            {
                id: "ChaCha20-Poly1305",
                name: "ChaCha20-Poly1305",
                description: "Fast & modern",
                icon: "⚡",
                badge: "MODERN",
                badgeType: "default",
            },
            {
                id: "XChaCha20-Poly1305",
                name: "XChaCha20-Poly1305",
                description: "Strong & flexible",
                icon: "🛡️",
                badge: "ADVANCED",
                badgeType: "default",
            },
        ],
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
            },
            {
                id: "RSA-3072",
                name: "RSA-3072",
                description: "Stronger protection",
                icon: "🛡️",
                badge: "STRONG",
                badgeType: "default",
            },
            {
                id: "RSA-4096",
                name: "RSA-4096",
                description: "Maximum RSA strength",
                icon: "🛡️",
                badge: "HIGH SECURITY",
                badgeType: "default",
            },
        ],
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
            },
            {
                id: "X25519",
                name: "X25519",
                description: "Fast & modern key exchange",
                icon: "⚡",
                badge: "MODERN",
                badgeType: "default",
            },
        ],
    },
};

function App() {
    const [mode, setMode] = useState<Mode>("encrypt");
    const [ResourceType, setResourceType] = useState<ResourceType>("text");
    const [selectedAlgorithm, setSelectedAlgorithm] = useState("AES-256-GCM");
    const [openCategory, setOpenCategory] = useState<string | null>("symmetric");

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
                            <div className="resource-types">
                                <button
                                    className={ResourceType === "file" ? "resource-type active" : "resource-type"}
                                    onClick={() => setResourceType("file")}>
                                    <span>📁</span>File
                                </button>
                                <button
                                    className={ResourceType === "image" ? "resource-type active" : "resource-type"}
                                    onClick={() => setResourceType("image")}>
                                    <span>📸</span>Image
                                </button>
                                <button
                                    className={ResourceType === "text" ? "resource-type active" : "resource-type"}
                                    onClick={() => setResourceType("text")}>
                                    <span>📄</span>Text
                                </button>
                                <button
                                    className={ResourceType === "audio" ? "resource-type active" : "resource-type"}
                                    onClick={() => setResourceType("audio")}>
                                    <span>🔊</span>Audio
                                </button>
                                <button
                                    className={ResourceType === "video" ? "resource-type active" : "resource-type"}
                                    onClick={() => setResourceType("video")}>
                                    <span>🎬</span>Video
                                </button>
                                <button
                                    className={ResourceType === "folder" ? "resource-type active" : "resource-type"}
                                    onClick={() => setResourceType("folder")}>
                                    <span>📂</span>Folder
                                </button>
                            </div>

                            {ResourceType === "text" ? (
                                <textarea className="text-input"
                                    placeholder={mode === "encrypt" ? "Enter the text you want secured..." : "Paste your encrypted text here..."}
                                ></textarea>
                            ) : (
                                <div className="drop-zone">
                                    <div className="upload-icon">↑</div>
                                    <strong>Drop your {ResourceType} here</strong>
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

                                {Object.values(algorithmCategories).map(
                                    (category) => {
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
                                                        {category.algorithms.map(
                                                            (algorithm) => {
                                                                const isSelected = selectedAlgorithm === algorithm.id;

                                                                return (
                                                                    <button
                                                                        key={algorithm.id}
                                                                        className={`algorithm-card ${isSelected ? "selected" : ""}`}
                                                                        onClick={() => setSelectedAlgorithm(algorithm.id)}
                                                                    >
                                                                        <div className="algorithm-icon">{algorithm.icon}</div>

                                                                        <div className="algorithm-info">
                                                                            <strong>{algorithm.name}</strong>
                                                                            <span>{algorithm.description}</span>
                                                                        </div>

                                                                        <div
                                                                            className={`algorithm-badge ${algorithm.badgeType === "recommended" ? "recommended" : ""}`}
                                                                        >
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
                            <label className="field-label key-label">
                                {mode === "encrypt" ? "Encryption password" : "Decryption password"}
                            </label>
                            <div className="password-input">
                                <input type="password" placeholder="Enter your secret key" />
                                <button>◉</button>
                            </div>
                            <div className="security-note">
                                <span>✓</span>
                                Your Encryption key is processed locally
                            </div>
                            <button className="primary-action">
                                <span>{mode === "encrypt" ? "🔒" : "🔓"}</span>
                                {mode === "encrypt" ? "Encrypt Resource" : "Decrypt Resource"}
                            </button>
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