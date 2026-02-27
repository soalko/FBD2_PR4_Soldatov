const express = require("express");
const {nanoid} = require("nanoid");

const router = express.Router();

let products = require("../data/products");

/**
 * Вспомогательная функция: найти товар по id (id строковый)
 */
function findById(id) {
    return products.find((p) => p.id === id) || null;
}


/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - id
 *         - title
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор товара
 *           example: "abc12345"
 *         title:
 *           type: string
 *           description: Название товара
 *           example: "Смартфон Galaxy S21"
 *         category:
 *           type: string
 *           description: Категория товара
 *           example: "Электроника"
 *         description:
 *           type: string
 *           description: Описание товара
 *           example: "Современный смартфон с отличной камерой"
 *         price:
 *           type: number
 *           description: Цена товара
 *           example: 59999
 *         stock:
 *           type: number
 *           description: Количество на складе
 *           example: 10
 *         rating:
 *           type: number
 *           description: Рейтинг товара (1-5)
 *           example: 4.5
 *         imageUrl:
 *           type: string
 *           description: URL изображения товара
 *           example: "https://example.com/image.jpg"
 *     ProductInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Название товара
 *           example: "Новый товар"
 *         category:
 *           type: string
 *           description: Категория товара
 *           example: "Электроника"
 *         description:
 *           type: string
 *           description: Описание товара
 *           example: "Описание нового товара"
 *         price:
 *           type: number
 *           description: Цена товара
 *           example: 1000
 *         stock:
 *           type: number
 *           description: Количество на складе
 *           example: 5
 *         rating:
 *           type: number
 *           description: Рейтинг товара
 *           example: 4.2
 *         imageUrl:
 *           type: string
 *           description: URL изображения
 *           example: "https://example.com/new-product.jpg"
 *   responses:
 *     ProductNotFound:
 *       description: Товар не найден
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: "Product not found"
 *     ValidationError:
 *       description: Ошибка валидации
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: "title is required (string)"
 */


/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */

// GET /api/products — список товаров
router.get("/", (req, res) => {
    res.json(products);
});


/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Товар успешно найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         $ref: '#/components/responses/ProductNotFound'
 */
// GET /api/products/:id — один товар
router.get("/:id", (req, res) => {
    const product = findById(req.params.id);
    if (!product) return res.status(404).json({error: "Product not found"});
    res.json(product);
});



/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
// POST /api/products — добавить товар
router.post("/", (req, res) => {
    const {title, category, description, price, stock, rating, imageUrl} = req.body;

    if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({error: "title is required (string)"});
    }

    const newProduct = {
        id: nanoid(8),
        title: title.trim(),
        category: typeof category === "string" ? category.trim() : "Без категории",
        description: typeof description === "string" ? description.trim() : "",
        price: Number(price) || 0,
        stock: Number(stock) || 0,
        rating: rating !== undefined ? Number(rating) : undefined,
        imageUrl: typeof imageUrl === "string" ? imageUrl.trim() : "",
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});


/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Частично обновить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Товар успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         $ref: '#/components/responses/ProductNotFound'
 */
// PATCH /api/products/:id — частичное обновление
router.patch("/:id", (req, res) => {
    const product = findById(req.params.id);
    if (!product) return res.status(404).json({error: "Product not found"});

    const {title, category, description, price, stock, rating, imageUrl} = req.body;

    // TODO (студентам): валидация PATCH (если поле пришло — проверить)
    if (title !== undefined) product.title = String(title).trim();
    if (category !== undefined) product.category = String(category).trim();
    if (description !== undefined) product.description = String(description).trim();
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (rating !== undefined) product.rating = Number(rating);
    if (imageUrl !== undefined) product.imageUrl = String(imageUrl).trim();

    res.json(product);
});


/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Товар успешно удален
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *       404:
 *         $ref: '#/components/responses/ProductNotFound'
 */
// DELETE /api/products/:id — удалить товар
router.delete("/:id", (req, res) => {
    const id = req.params.id;
    const before = products.length;
    products = products.filter((p) => p.id !== id);

    if (products.length === before) {
        return res.status(404).json({error: "Product not found"});
    }

    // Обычно делают 204 No Content, но для наглядности вернём JSON
    res.json({ok: true});
});

module.exports = router;
