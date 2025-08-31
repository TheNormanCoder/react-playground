import React, { useCallback, useContext, useMemo, useReducer, useRef, useState, createContext, lazy, Suspense } from "react";
import { createPortal } from "react-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { inc, dec } from "./store";



/********************
 * React Concepts Playground
 *
 * Un singolo file che mostra i principali concetti di React,
 * ognuno incapsulato in un componente dedicato e spiegato.
 *
 * Come usare (con Vite):
 * 1) npm create vite@latest react-playground -- --template react
 * 2) cd react-playground && npm install
 * 3) sostituisci il contenuto di src/App.jsx con questo file
 * 4) npm run dev
 ********************/

/************** Utilità **************/
// Hook personalizzato: sincronizza uno stato con localStorage
function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item !== null ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch {}
    }, [key, value]);
    return [value, setValue];
}

/************** Context **************/
const ThemeContext = createContext();
function ThemeProvider({ children }) {
    const [theme, setTheme] = useLocalStorage("theme", "light");
    const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));
    const value = useMemo(() => ({ theme, toggle }), [theme]);
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme deve essere usato dentro ThemeProvider");
    return ctx;
}

/************** Error Boundary (classico) **************/
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, info) {
        console.error("ErrorBoundary:", error, info);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={styles.cardError}>
                    <h3>Qualcosa è andato storto 😅</h3>
                    <p>Questo è un esempio di Error Boundary.</p>
                    <button onClick={() => this.setState({ hasError: false })}>Reset</button>
                </div>
            );
        }
        return this.props.children;
    }
}

/************** Lazy + Suspense **************/
// Simuliamo un componente pesante caricato dinamicamente
const HeavyComponent = lazy(() =>
    new Promise((resolve) =>
        setTimeout(
            () =>
                resolve({
                    default: function Heavy() {
                        return (
                            <div style={styles.card}>
                                <h4>Caricamento dinamico (lazy)</h4>
                                <p>
                                    Questo componente è stato caricato con <code>React.lazy</code> e
                                    mostrato con <code>Suspense</code>.
                                </p>
                            </div>
                        );
                    },
                }),
            600
        )
    )
);

/************** Portale (Modal) **************/
function Modal({ open, onClose, children }) {
    if (!open) return null;
    return createPortal(
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                {children}
                <div style={{ marginTop: 12, textAlign: "right" }}>
                    <button onClick={onClose}>Chiudi</button>
                </div>
            </div>
        </div>,
        document.body
    );
}

/************** Demo: Props **************/
function PropsDemo({ titolo, children }) {
    return (
        <div style={styles.card}>
            <h4>Props</h4>
            <p>
                Le <strong>props</strong> sono l'input dei componenti. Qui <code>titolo</code> = "{titolo}" e
                i <code>children</code> sono mostrati sotto.
            </p>
            <div style={styles.inlineBox}>{children}</div>
        </div>
    );
}

/************** Demo: Stato (useState) **************/
function StateDemo() {
    const [count, setCount] = useState(0);
    return (
        <div style={styles.card}>
            <h4>Stato (useState)</h4>
            <p>Lo stato rende i componenti interattivi.</p>
            <div style={styles.row}>
                <button onClick={() => setCount((c) => c - 1)}>-</button>
                <span style={styles.counter}>{count}</span>
                <button onClick={() => setCount((c) => c + 1)}>+</button>
            </div>
        </div>
    );
}

/************** Demo: Effetti (useEffect) **************/
function EffectDemo() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const ctrl = new AbortController();
        async function run() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("https://jsonplaceholder.typicode.com/users", {
                    signal: ctrl.signal,
                });
                if (!res.ok) throw new Error("HTTP " + res.status);
                const data = await res.json();
                setUsers(data.slice(0, 4));
            } catch (e) {
                if (e.name !== "AbortError") setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        run();
        return () => ctrl.abort();
    }, []);

    return (
        <div style={styles.card}>
            <h4>Effetti (useEffect)</h4>
            <p>Fetch di dati con cleanup tramite AbortController.</p>
            {loading && <p>Caricamento...</p>}
            {error && <p style={{ color: "crimson" }}>Errore: {error}</p>}
            <ul>
                {users.map((u) => (
                    <li key={u.id}>{u.name}</li>
                ))}
            </ul>
        </div>
    );
}

/************** Demo: Memo & Callback **************/
function ExpensiveList({ items, onPick }) {
    // Simula calcolo costoso
    const computed = useMemo(() => items.map((x) => x * x), [items]);
    return (
        <ul>
            {computed.map((x) => (
                <li key={x}>
                    <button onClick={() => onPick(x)}>{x}</button>
                </li>
            ))}
        </ul>
    );
}
function MemoCallbackDemo() {
    const [n, setN] = useState(5);
    const [picked, setPicked] = useState(null);
    const list = useMemo(() => Array.from({ length: n }, (_, i) => i + 1), [n]);
    const onPick = useCallback((val) => setPicked(val), []);
    return (
        <div style={styles.card}>
            <h4>useMemo & useCallback</h4>
            <p>
                <code>useMemo</code> memoizza valori derivati; <code>useCallback</code> memoizza
                funzioni per evitare render inutili.
            </p>
            <div style={styles.row}>
                <label>Elementi: </label>
                <input
                    type="range"
                    min={1}
                    max={20}
                    value={n}
                    onChange={(e) => setN(Number(e.target.value))}
                />
                <span style={{ marginLeft: 8 }}>{n}</span>
            </div>
            <ExpensiveList items={list} onPick={onPick} />
            {picked && <p>Hai scelto: {picked}</p>}
        </div>
    );
}

/************** Demo: Ref **************/
function RefDemo() {
    const inp = useRef(null);
    return (
        <div style={styles.card}>
            <h4>Ref (useRef)</h4>
            <p>Gestisce focus/DOM imperativo senza triggerare re-render.</p>
            <input ref={inp} placeholder="Clicca il bottone per focus" />
            <button style={{ marginLeft: 8 }} onClick={() => inp.current?.focus()}>
                Focus
            </button>
        </div>
    );
}

/************** Demo: Form controllato **************/
function FormDemo() {
    const [form, setForm] = useState({ nome: "", email: "" });
    const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const onSubmit = (e) => {
        e.preventDefault();
        alert("Dati inviati: " + JSON.stringify(form, null, 2));
    };
    return (
        <div style={styles.card}>
            <h4>Form controllati</h4>
            <form onSubmit={onSubmit}>
                <div style={styles.row}>
                    <label style={styles.lbl}>Nome</label>
                    <input name="nome" value={form.nome} onChange={handle} />
                </div>
                <div style={styles.row}>
                    <label style={styles.lbl}>Email</label>
                    <input name="email" value={form.email} onChange={handle} />
                </div>
                <button>Invia</button>
            </form>
        </div>
    );
}

/************** Demo: useReducer **************/
function todosReducer(state, action) {
    switch (action.type) {
        case "add": {
            const text = action.text.trim();
            if (!text) return state;
            return [...state, { id: Date.now(), text, done: false }];
        }
        case "toggle":
            return state.map(t => (t.id === action.id ? { ...t, done: !t.done } : t));
        case "clearDone":
            return state.filter(t => !t.done);
        case "clearAll":
            return [];
        default:
            return state;
    }
}

function ReducerDemo() {
    const [todos, dispatch] = useReducer(todosReducer, []);
    const [text, setText] = useState("");

    const add = () => {
        dispatch({ type: "add", text });
        setText("");
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            add();
        }
    };

    return (
        <div style={styles.card}>
            <h4>useReducer (state complesso)</h4>

            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <input
                    type="text"
                    placeholder="Aggiungi todo"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={onKeyDown}
                    style={{ flex: 1, minWidth: 0 }}
                />
                <button onClick={add}>Aggiungi</button>
            </div>

            {todos.length === 0 ? (
                <p style={{ opacity: 0.7, marginTop: 8 }}>Nessun elemento. Aggiungine uno sopra ⬆️</p>
            ) : (
                <ul style={{ margin: 0, paddingLeft: 18, maxHeight: 180, overflow: "auto" }}>
                    {todos.map((t) => (
                        <li key={t.id} style={{ margin: "6px 0" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <input
                                    type="checkbox"
                                    checked={t.done}
                                    onChange={() => dispatch({ type: "toggle", id: t.id })}
                                />
                                <span style={{ textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
                            </label>
                        </li>
                    ))}
                </ul>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button onClick={() => dispatch({ type: "clearDone" })}>Pulisci fatti</button>
                <button onClick={() => dispatch({ type: "clearAll" })}>Pulisci tutti</button>
                <span style={{ marginLeft: "auto", opacity: 0.7 }}>
          Totali: <b>{todos.length}</b> · Fatti:{" "}
                    <b>{todos.filter(t => t.done).length}</b>
        </span>
            </div>
        </div>
    );
}


/************** Demo: Context (tema) **************/
function ContextDemo() {
    const { theme, toggle } = useTheme();
    return (
        <div style={styles.card}>
            <h4>Context</h4>
            <p>
                Il <code>Context</code> passa dati (tema) a tutta la subtree senza prop drilling.
            </p>
            <p>
                Tema attuale: <strong>{theme}</strong>
            </p>
            <button onClick={toggle}>Toggle tema</button>
        </div>
    );
}

/************** Demo: Children & Render Props **************/
function Card({ title, children, footer }) {
    return (
        <div style={styles.card}>
            <h4>{title}</h4>
            <div>{children}</div>
            <div style={{ marginTop: 8, opacity: 0.8 }}>{typeof footer === "function" ? footer() : footer}</div>
        </div>
    );
}
function ChildrenDemo() {
    const [t, setT] = useState(Date.now());
    useEffect(() => {
        const id = setInterval(() => setT(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);
    return (
        <Card title="Children & Render Props" footer={() => <em>Ora: {new Date(t).toLocaleTimeString()}</em>}>
            <p>
                <code>children</code> e <code>render props</code> danno grande flessibilità di composizione.
            </p>
        </Card>
    );
}

/************** Demo: Portals (Modal) **************/
function PortalDemo() {
    const [open, setOpen] = useState(false);
    return (
        <div style={styles.card}>
            <h4>Portals</h4>
            <p>Renderizza un Modal fuori dalla gerarchia del DOM del componente.</p>
            <button onClick={() => setOpen(true)}>Apri modal</button>
            <Modal open={open} onClose={() => setOpen(false)}>
                <h3>Modal via Portal</h3>
                <p>Questo contenuto è stato montato in <code>document.body</code>.</p>
            </Modal>
        </div>
    );
}

/************** Demo: Error Boundary in azione **************/
function KaboomButton() {
    const [boom, setBoom] = useState(false);
    if (boom) throw new Error("BOOM!");
    return <button onClick={() => setBoom(true)}>Genera errore</button>;
}
function ErrorBoundaryDemo() {
    return (
        <div style={styles.card}>
            <h4>Error Boundary</h4>
            <p>Cattura eccezioni dei figli durante il render.</p>
            <ErrorBoundary>
                <KaboomButton />
            </ErrorBoundary>
        </div>
    );
}

/************** App principale **************/
export default function App() {
    const [showHeavy, setShowHeavy] = useState(false);
    return (
        <ThemeProvider>
            <Page>
                <Header />
                <Grid>
                    <PropsDemo titolo="Playground React">
                        <span style={styles.tag}>#componenti</span>
                        <span style={styles.tag}>#props</span>
                    </PropsDemo>

                    <StateDemo />
                    <EffectDemo />
                    <FormDemo />
                    <RefDemo />
                    <ReducerDemo />

                    <ReduxCounter />   {/* ⬅️ QUI */}

                    <MemoCallbackDemo />
                    <ContextDemo />
                    <ChildrenDemo />
                    <PortalDemo />

                    <div style={styles.card}>
                        <h4>Lazy & Suspense</h4>
                        <p>Carica componenti on-demand.</p>
                        <button onClick={() => setShowHeavy((s) => !s)}>
                            {showHeavy ? "Nascondi" : "Carica"} componente pesante
                        </button>
                        {showHeavy && (
                            <Suspense fallback={<p>Caricamento componente...</p>}>
                                <HeavyComponent />
                            </Suspense>
                        )}
                    </div>
                </Grid>

                <Footer />
            </Page>
        </ThemeProvider>
    );
}

/************** Layout & Stili **************/
function Page({ children }) {
    const { theme } = useTheme();

    useEffect(() => {
        const bg = theme === "light" ? "#f6f7fb" : "#0f1115";
        const fg = theme === "light" ? "#0f1115" : "#f6f7fb";
        document.body.style.background = bg;
        document.body.style.color = fg;
    }, [theme]);

    return (
        <div
            style={{
                minHeight: "100svh",
                background: theme === "light" ? "#f6f7fb" : "#0f1115",
                color: theme === "light" ? "#0f1115" : "#f6f7fb",
                transition: "background .2s, color .2s",
            }}
        >
            {children}
        </div>
    );
}

function Header() {
    const { theme, toggle } = useTheme();
    return (
        <header style={styles.header}>
            <h2>React Concepts Playground</h2>
            <div>
                <span style={{ marginRight: 8 }}>Tema: {theme}</span>
                <button onClick={toggle}>Toggle</button>
            </div>
        </header>
    );
}
function Footer() {
    return (
        <footer style={styles.footer}>
            <small>
                Copriamo: props, state, effect, memo, callback, ref, form controllati,
                reducer, context, children/render props, portals, error boundary, lazy & suspense,
                custom hooks (useLocalStorage).
            </small>
        </footer>
    );
}
function Grid({ children }) {
    return <main style={styles.grid}>{children}</main>;
}

function ReduxCounter() {
    const v = useSelector((s) => s.counter.value);
    const d = useDispatch();
    return (
        <div style={styles.card}>
            <h4>Redux Toolkit</h4>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => d(dec())}>-</button>
                <span style={{ minWidth: 32, textAlign: "center" }}>{v}</span>
                <button onClick={() => d(inc())}>+</button>
            </div>
        </div>
    );
}


const styles = {
    header: {
        position: "sticky",
        top: 0,
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 24px",
        borderBottom: "1px solid rgba(0,0,0,.1)",
        background: "inherit",
        backdropFilter: "blur(6px)",
    },
    footer: {
        marginTop: 16,
        padding: 16,
        textAlign: "center",
        opacity: 0.8,
    },
    grid: {
        display: "grid",
        gap: 16,
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        padding: 16,
        maxWidth: 1200,
        margin: "0 auto",
    },
    card: {
        padding: 16,
        border: "1px solid rgba(0,0,0,.1)",
        borderRadius: 12,
        boxShadow: "0 4px 18px rgba(0,0,0,.05)",
    },
    cardError: {
        padding: 16,
        border: "1px solid rgba(255,0,0,.3)",
        borderRadius: 12,
        background: "rgba(255,0,0,.05)",
    },
    row: { display: "flex", alignItems: "center", gap: 8, marginTop: 8 },
    counter: { minWidth: 40, textAlign: "center", fontVariantNumeric: "tabular-nums" },
    tag: { padding: "2px 6px", border: "1px solid #aaa", borderRadius: 8, marginRight: 8, fontSize: 12 },
    inlineBox: { padding: 8, border: "1px dashed #aaa", borderRadius: 8, marginTop: 8 },
    lbl: { width: 64, display: "inline-block" },
    modalOverlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.4)",
        display: "grid",
        placeItems: "center",
        padding: 16,
    },
    modal: {
        background: "white",
        color: "black",
        width: "min(560px, 100%)",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 10px 32px rgba(0,0,0,.3)",
    },
};
