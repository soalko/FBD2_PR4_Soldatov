import {useEffect, useMemo, useState} from "react";
import {createProduct, deleteProduct, getProducts, updateProduct} from "./api/productsApi";

/**
 * Практика 4 (заготовка).
 * Важно: это НЕ готовое решение. В файле api/productsApi.js стоят TODO.
 * Цель: подключить React к вашему Express API и выполнить базовый CRUD.
 */
export default function App() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Расширенная форма добавления товара
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [stock, setStock] = useState("");


    const canSubmit = useMemo(() =>
            title.trim() !== "" &&
            price !== "" &&
            Number(price) > 0 &&
            category.trim() !== "",
        [title, price, category]);

    async function load() {
        setError("");
        setLoading(true);
        try {
            const data = await getProducts();
            setItems(data);
        } catch (e) {
            setError(String(e?.message || e));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function onAdd(e) {
        e.preventDefault();
        if (!canSubmit) return;

        setError("");
        try {
            await createProduct({
                title: title.trim(),
                price: Number(price),
                category: category.trim(),
                description: description.trim(),
                stock: stock ? Number(stock) : 0,
                createdAt: new Date().toISOString()
            });
            // Очистка формы
            setTitle("");
            setPrice("");
            setCategory("");
            setDescription("");
            setStock("");
            await load();
        } catch (e) {
            setError(String(e?.message || e));
        }
    }

    async function onDelete(id) {
        if (!window.confirm("Вы уверены, что хотите удалить товар?")) return;

        setError("");
        try {
            await deleteProduct(id);
            await load();
        } catch (e) {
            setError(String(e?.message || e));
        }
    }

    async function onUpdateField(id, field, value) {
        setError("");
        try {
            await updateProduct(id, {[field]: value});
            await load();
        } catch (e) {
            setError(String(e?.message || e));
        }
    }

    async function onPricePlus(id, currentPrice) {
        await onUpdateField(id, 'price', Number(currentPrice) + 10);
    }

    async function onPriceMinus(id, currentPrice) {
        await onUpdateField(id, 'price', Number(currentPrice) - 10);
    }

    async function onStockChange(id, currentStock, change) {
        const newStock = Math.max(0, Number(currentStock) + change);
        await onUpdateField(id, 'stock', newStock);
    }

    return (
        <div style={{maxWidth: 1200, margin: "0 auto", padding: 24, fontFamily: "system-ui"}}>
            <h1>Практика 4 — React + Express API</h1>
            <p style={{color: "#555"}}>
                Управление товарами с полным CRUD функционалом
            </p>

            <section style={{
                marginTop: 24,
                padding: 24,
                border: "1px solid #ddd",
                borderRadius: 12,
                backgroundColor: "#f9f9f9"
            }}>
                <h2 style={{marginTop: 0, marginBottom: 20}}>➕ Добавить новый товар</h2>

                <form onSubmit={onAdd} style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 16
                }}>
                    <div style={{display: "flex", flexDirection: "column", gap: 4}}>
                        <label style={{fontSize: 14, fontWeight: 500}}>Название *</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Например: Смартфон"
                            style={{padding: 10, borderRadius: 6, border: "1px solid #ddd"}}
                            required
                        />
                    </div>

                    <div style={{display: "flex", flexDirection: "column", gap: 4}}>
                        <label style={{fontSize: 14, fontWeight: 500}}>Цена *</label>
                        <input
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0"
                            type="number"
                            min="0"
                            step="0.01"
                            style={{padding: 10, borderRadius: 6, border: "1px solid #ddd"}}
                            required
                        />
                    </div>

                    <div style={{display: "flex", flexDirection: "column", gap: 4}}>
                        <label style={{fontSize: 14, fontWeight: 500}}>Категория *</label>
                        <input
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Например: Электроника"
                            style={{padding: 10, borderRadius: 6, border: "1px solid #ddd"}}
                            required
                        />
                    </div>

                    <div style={{display: "flex", flexDirection: "column", gap: 4}}>
                        <label style={{fontSize: 14, fontWeight: 500}}>Остаток</label>
                        <input
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            placeholder="10"
                            type="number"
                            min="0"
                            style={{padding: 10, borderRadius: 6, border: "1px solid #ddd"}}
                        />
                    </div>

                    <div style={{display: "flex", flexDirection: "column", gap: 4, gridColumn: "1/-1"}}>
                        <label style={{fontSize: 14, fontWeight: 500}}>Описание</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Подробное описание товара..."
                            rows={3}
                            style={{padding: 10, borderRadius: 6, border: "1px solid #ddd", resize: "vertical"}}
                        />
                    </div>

                    <div style={{gridColumn: "1/-1", display: "flex", gap: 12, marginTop: 8}}>
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            style={{
                                padding: "12px 24px",
                                backgroundColor: canSubmit ? "#007bff" : "#ccc",
                                color: "white",
                                border: "none",
                                borderRadius: 6,
                                cursor: canSubmit ? "pointer" : "not-allowed",
                                fontSize: 16
                            }}
                        >
                            Добавить товар
                        </button>
                        <button
                            type="button"
                            onClick={load}
                            style={{
                                padding: "12px 24px",
                                backgroundColor: "#6c757d",
                                color: "white",
                                border: "none",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontSize: 16
                            }}
                        >
                            Обновить список
                        </button>
                    </div>
                </form>
            </section>

            <section style={{marginTop: 32}}>
                <h2 style={{display: "flex", alignItems: "center", gap: 12}}>
                    📦 Список товаров
                    {items.length > 0 && (
                        <span style={{
                            fontSize: 14,
                            backgroundColor: "#007bff",
                            color: "white",
                            padding: "4px 10px",
                            borderRadius: 20
                        }}>
                            {items.length} шт.
                        </span>
                    )}
                </h2>

                {loading && (
                    <div style={{textAlign: "center", padding: 40}}>
                        <div style={{
                            width: 40,
                            height: 40,
                            border: "3px solid #f3f3f3",
                            borderTop: "3px solid #007bff",
                            borderRadius: "50%",
                            margin: "0 auto",
                            animation: "spin 1s linear infinite"
                        }}/>
                        <p style={{marginTop: 12}}>Загрузка...</p>
                    </div>
                )}

                {error && (
                    <div style={{
                        padding: 16,
                        backgroundColor: "#f8d7da",
                        border: "1px solid #f5c6cb",
                        borderRadius: 8,
                        color: "#721c24",
                        marginBottom: 20
                    }}>
                        <strong>Ошибка:</strong> {error}
                        <br/>
                        <small>Проверьте, что: (1) backend запущен на 3000, (2) CORS настроен, (3) функции в
                            productsApi.js реализованы.</small>
                    </div>
                )}

                {!loading && items.length === 0 && !error && (
                    <div style={{
                        textAlign: "center",
                        padding: 60,
                        backgroundColor: "#f8f9fa",
                        borderRadius: 12
                    }}>
                        <p style={{fontSize: 18, color: "#6c757d"}}>Товаров пока нет</p>
                        <p style={{color: "#6c757d"}}>Добавьте первый товар с помощью формы выше</p>
                    </div>
                )}

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: 20,
                    marginTop: 20
                }}>
                    {items.map((p) => (
                        <div key={p.id} style={{
                            border: "1px solid #e0e0e0",
                            borderRadius: 12,
                            overflow: "hidden",
                            backgroundColor: "white",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                            transition: "transform 0.2s, box-shadow 0.2s",
                            cursor: "default"
                        }}>
                            <div style={{padding: 16}}>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "start",
                                    marginBottom: 8
                                }}>
                                    <h3 style={{margin: 0, fontSize: 18}}>{p.title}</h3>
                                    <span style={{
                                        backgroundColor: "#28a745",
                                        color: "white",
                                        padding: "4px 8px",
                                        borderRadius: 4,
                                        fontSize: 14,
                                        fontWeight: "bold"
                                    }}>
                                        {p.price} ₽
                                    </span>
                                </div>

                                <div style={{marginBottom: 12, fontSize: 14, color: "#666"}}>
                                    <div>Категория: {p.category || "Не указана"}</div>
                                    {p.stock !== undefined && (
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            marginTop: 4
                                        }}>
                                            <span>Остаток: {p.stock} шт.</span>
                                            <button
                                                onClick={() => onStockChange(p.id, p.stock, -1)}
                                                style={{
                                                    padding: "2px 8px",
                                                    backgroundColor: "#dc3545",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: 4,
                                                    cursor: "pointer",
                                                    fontSize: 12
                                                }}
                                                disabled={p.stock <= 0}
                                            >
                                                -
                                            </button>
                                            <button
                                                onClick={() => onStockChange(p.id, p.stock, 1)}
                                                style={{
                                                    padding: "2px 8px",
                                                    backgroundColor: "#28a745",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: 4,
                                                    cursor: "pointer",
                                                    fontSize: 12
                                                }}
                                            >
                                                +
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {p.description && (
                                    <p style={{
                                        fontSize: 14,
                                        color: "#666",
                                        margin: "12px 0",
                                        padding: "12px 0",
                                        borderTop: "1px solid #eee",
                                        borderBottom: "1px solid #eee"
                                    }}>
                                        {p.description.length > 100
                                            ? `${p.description.substring(0, 100)}...`
                                            : p.description}
                                    </p>
                                )}

                                <div style={{
                                    display: "flex",
                                    gap: 8,
                                    marginTop: 16
                                }}>
                                    <button
                                        onClick={() => onPricePlus(p.id, p.price)}
                                        style={{
                                            padding: "8px 12px",
                                            backgroundColor: "#ff6d00",
                                            border: "none",
                                            borderRadius: 6,
                                            cursor: "pointer",
                                            fontSize: 13,
                                            flex: 1
                                        }}
                                    >
                                        +10 ₽
                                    </button>
                                    <button
                                        onClick={() => onPriceMinus(p.id, p.price)}
                                        style={{
                                            padding: "8px 12px",
                                            backgroundColor: "#ffc000",
                                            border: "none",
                                            borderRadius: 6,
                                            cursor: "pointer",
                                            fontSize: 13,
                                            flex: 1
                                        }}
                                    >
                                        -10 ₽
                                    </button>
                                    <button
                                        onClick={() => onDelete(p.id)}
                                        style={{
                                            padding: "8px 12px",
                                            backgroundColor: "#dc3545",
                                            color: "white",
                                            border: "none",
                                            borderRadius: 6,
                                            cursor: "pointer",
                                            fontSize: 13,
                                            flex: 1
                                        }}
                                    >
                                        Удалить
                                    </button>
                                </div>

                                {p.createdAt && (
                                    <div style={{
                                        fontSize: 11,
                                        color: "#999",
                                        marginTop: 12,
                                        textAlign: "right"
                                    }}>
                                        Добавлено: {new Date(p.createdAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                button:hover {
                    opacity: 0.9;
                }
            `}</style>
        </div>
    );
}