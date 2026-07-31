import { type FormEvent, useEffect, useState } from 'react'
import { Icon } from '../../components/common/Icon'
import { MerchantHeader } from '../../components/layout/MerchantHeader'
import { useAuth } from '../../context/AuthContext'
import { merchantCatalogApi } from '../../services/catalogApi'
import type {
  Product,
  ProductCategory,
  SaveProductCategoryInput,
  SaveProductInput,
} from '../../types/catalog'

export function MerchantProductsPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [editingCategory, setEditingCategory] =
    useState<ProductCategory | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [categoryFormVersion, setCategoryFormVersion] = useState(0)
  const [productFormVersion, setProductFormVersion] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { accessToken } = useAuth()

  useEffect(() => {
    if (!accessToken) return
    let active = true

    Promise.all([
      merchantCatalogApi.getCategories(accessToken),
      merchantCatalogApi.getProducts(accessToken),
    ])
      .then(([nextCategories, nextProducts]) => {
        if (!active) return
        setCategories(nextCategories)
        setProducts(nextProducts)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(
          reason instanceof Error
            ? reason.message
            : 'No fue posible cargar el catálogo.',
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [accessToken])

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!accessToken) return
    const form = new FormData(event.currentTarget)
    const input: SaveProductCategoryInput = {
      name: String(form.get('name') ?? '').trim(),
      displayOrder: Number(form.get('displayOrder')),
      isActive: form.get('isActive') === 'on',
    }
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const response = editingCategory
        ? await merchantCatalogApi.updateCategory(
            editingCategory.id,
            input,
            accessToken,
          )
        : await merchantCatalogApi.createCategory(input, accessToken)

      setCategories((current) => {
        const exists = current.some((category) => category.id === response.id)
        const next = exists
          ? current.map((category) =>
              category.id === response.id ? response : category,
            )
          : [...current, response]
        return next.sort(
          (first, second) =>
            first.displayOrder - second.displayOrder ||
            first.name.localeCompare(second.name),
        )
      })
      setEditingCategory(null)
      setCategoryFormVersion((value) => value + 1)
      setMessage(
        editingCategory ? 'Categoría actualizada.' : 'Categoría creada.',
      )
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible guardar la categoría.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function deleteCategory(category: ProductCategory) {
    if (
      !accessToken ||
      !window.confirm(`¿Eliminar la categoría “${category.name}”?`)
    ) {
      return
    }

    setError('')
    setMessage('')
    try {
      await merchantCatalogApi.deleteCategory(category.id, accessToken)
      setCategories((current) =>
        current.filter((item) => item.id !== category.id),
      )
      setMessage('Categoría eliminada.')
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible eliminar la categoría.',
      )
    }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!accessToken) return
    const form = new FormData(event.currentTarget)
    const imageUrl = String(form.get('imageUrl') ?? '').trim()
    const input: SaveProductInput = {
      productCategoryId: String(form.get('productCategoryId') ?? ''),
      name: String(form.get('name') ?? '').trim(),
      description: String(form.get('description') ?? '').trim(),
      price: Number(form.get('price')),
      imageUrl: imageUrl || null,
      isAvailable: form.get('isAvailable') === 'on',
      isFeatured: form.get('isFeatured') === 'on',
      preparationTimeMinutes: Number(form.get('preparationTimeMinutes')),
    }
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const response = editingProduct
        ? await merchantCatalogApi.updateProduct(
            editingProduct.id,
            input,
            accessToken,
          )
        : await merchantCatalogApi.createProduct(input, accessToken)

      setProducts((current) => {
        const exists = current.some((product) => product.id === response.id)
        const next = exists
          ? current.map((product) =>
              product.id === response.id ? response : product,
            )
          : [...current, response]
        return next.sort((first, second) =>
          first.name.localeCompare(second.name),
        )
      })
      setEditingProduct(null)
      setProductFormVersion((value) => value + 1)
      setMessage(
        editingProduct ? 'Producto actualizado.' : 'Producto publicado.',
      )
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible guardar el producto.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function deleteProduct(product: Product) {
    if (
      !accessToken ||
      !window.confirm(`¿Eliminar el producto “${product.name}”?`)
    ) {
      return
    }

    setError('')
    setMessage('')
    try {
      await merchantCatalogApi.deleteProduct(product.id, accessToken)
      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      )
      setMessage('Producto eliminado.')
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible eliminar el producto.',
      )
    }
  }

  function cancelCategoryEdit() {
    setEditingCategory(null)
    setCategoryFormVersion((value) => value + 1)
  }

  function cancelProductEdit() {
    setEditingProduct(null)
    setProductFormVersion((value) => value + 1)
  }

  return (
    <div className="dashboard-grid min-h-screen bg-background">
      <MerchantHeader />
      <main className="page-shell py-10 md:py-14">
        <p className="eyebrow">Catálogo del comercio</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-primary md:text-6xl">
          Categorías y productos
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Todo lo que publiques aquí aparecerá en la consulta pública cuando
          esté disponible y su categoría se encuentre activa.
        </p>

        {error ? (
          <div
            className="mt-6 rounded-2xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger"
            role="alert"
          >
            {error}
          </div>
        ) : null}
        {message ? (
          <div
            className="mt-6 rounded-2xl border border-success/20 bg-success/5 p-4 text-sm text-success"
            role="status"
          >
            {message}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-8 grid min-h-80 place-items-center text-muted">
            <span className="inline-flex items-center gap-2">
              <Icon className="animate-spin" name="progress_activity" />
              Cargando catálogo…
            </span>
          </div>
        ) : (
          <>
            <section className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
              <form
                className="card h-fit p-6"
                key={`${editingCategory?.id ?? 'new'}-${categoryFormVersion}`}
                onSubmit={saveCategory}
              >
                <p className="eyebrow">
                  {editingCategory ? 'Editar' : 'Nueva categoría'}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-primary">
                  {editingCategory
                    ? editingCategory.name
                    : 'Organiza tu menú'}
                </h2>
                <label className="mt-5 block">
                  <span className="mb-2 block text-sm font-semibold text-primary">
                    Nombre
                  </span>
                  <input
                    className="field"
                    defaultValue={editingCategory?.name}
                    maxLength={100}
                    minLength={2}
                    name="name"
                    required
                  />
                </label>
                <label className="mt-4 block">
                  <span className="mb-2 block text-sm font-semibold text-primary">
                    Orden
                  </span>
                  <input
                    className="field"
                    defaultValue={editingCategory?.displayOrder ?? 0}
                    max={10000}
                    min={0}
                    name="displayOrder"
                    required
                    type="number"
                  />
                </label>
                <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-primary">
                  <input
                    className="size-4"
                    defaultChecked={editingCategory?.isActive ?? true}
                    name="isActive"
                    type="checkbox"
                  />
                  Categoría activa
                </label>
                <div className="mt-6 flex gap-2">
                  <button
                    className="primary-button flex-1"
                    disabled={saving}
                    type="submit"
                  >
                    {editingCategory ? 'Actualizar' : 'Crear categoría'}
                  </button>
                  {editingCategory ? (
                    <button
                      className="icon-button border border-line"
                      onClick={cancelCategoryEdit}
                      type="button"
                    >
                      <Icon name="close" />
                    </button>
                  ) : null}
                </div>
              </form>

              <div className="card overflow-hidden">
                <div className="border-b border-line p-6">
                  <h2 className="font-display text-2xl font-semibold text-primary">
                    Categorías
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {categories.length} registradas
                  </p>
                </div>
                <div className="divide-y divide-line">
                  {categories.map((category) => (
                    <div
                      className="flex items-center gap-4 p-4"
                      key={category.id}
                    >
                      <span className="grid size-10 place-items-center rounded-xl bg-panel font-bold text-primary">
                        {category.displayOrder}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-primary">
                          {category.name}
                        </p>
                        <p className="text-xs text-muted">{category.slug}</p>
                      </div>
                      <span
                        className={`status-pill ${
                          category.isActive
                            ? 'bg-success/10 text-success'
                            : 'bg-panel text-muted'
                        }`}
                      >
                        {category.isActive ? 'Activa' : 'Oculta'}
                      </span>
                      <button
                        aria-label={`Editar ${category.name}`}
                        className="icon-button"
                        onClick={() => setEditingCategory(category)}
                        type="button"
                      >
                        <Icon name="edit" />
                      </button>
                      <button
                        aria-label={`Eliminar ${category.name}`}
                        className="icon-button text-danger"
                        onClick={() => deleteCategory(category)}
                        type="button"
                      >
                        <Icon name="delete" />
                      </button>
                    </div>
                  ))}
                  {!categories.length ? (
                    <p className="p-8 text-center text-sm text-muted">
                      Crea tu primera categoría para poder publicar productos.
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-[420px_1fr]">
              <form
                className="card h-fit p-6"
                key={`${editingProduct?.id ?? 'new'}-${productFormVersion}-${categories.length}`}
                onSubmit={saveProduct}
              >
                <p className="eyebrow">
                  {editingProduct ? 'Editar' : 'Nuevo producto'}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-primary">
                  {editingProduct?.name ?? 'Publica en el catálogo'}
                </h2>
                <label className="mt-5 block">
                  <span className="mb-2 block text-sm font-semibold text-primary">
                    Categoría
                  </span>
                  <select
                    className="field"
                    defaultValue={
                      editingProduct?.productCategoryId ??
                      categories.find((category) => category.isActive)?.id ??
                      ''
                    }
                    name="productCategoryId"
                    required
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                        {category.isActive ? '' : ' (oculta)'}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mt-4 block">
                  <span className="mb-2 block text-sm font-semibold text-primary">
                    Nombre
                  </span>
                  <input
                    className="field"
                    defaultValue={editingProduct?.name}
                    maxLength={150}
                    minLength={2}
                    name="name"
                    required
                  />
                </label>
                <label className="mt-4 block">
                  <span className="mb-2 block text-sm font-semibold text-primary">
                    Descripción
                  </span>
                  <textarea
                    className="field min-h-24 resize-y"
                    defaultValue={editingProduct?.description}
                    maxLength={1000}
                    minLength={5}
                    name="description"
                    required
                  />
                </label>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-primary">
                      Precio
                    </span>
                    <input
                      className="field"
                      defaultValue={editingProduct?.price}
                      min={0.01}
                      name="price"
                      required
                      step="0.01"
                      type="number"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-primary">
                      Preparación
                    </span>
                    <input
                      className="field"
                      defaultValue={
                        editingProduct?.preparationTimeMinutes ?? 20
                      }
                      max={240}
                      min={0}
                      name="preparationTimeMinutes"
                      required
                      type="number"
                    />
                  </label>
                </div>
                <label className="mt-4 block">
                  <span className="mb-2 block text-sm font-semibold text-primary">
                    URL de imagen
                  </span>
                  <input
                    className="field"
                    defaultValue={editingProduct?.imageUrl ?? ''}
                    name="imageUrl"
                    placeholder="https://..."
                    type="url"
                  />
                </label>
                <div className="mt-4 flex flex-wrap gap-5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <input
                      className="size-4"
                      defaultChecked={editingProduct?.isAvailable ?? true}
                      name="isAvailable"
                      type="checkbox"
                    />
                    Disponible
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <input
                      className="size-4"
                      defaultChecked={editingProduct?.isFeatured ?? false}
                      name="isFeatured"
                      type="checkbox"
                    />
                    Destacado
                  </label>
                </div>
                <div className="mt-6 flex gap-2">
                  <button
                    className="primary-button flex-1"
                    disabled={saving || categories.length === 0}
                    type="submit"
                  >
                    {editingProduct ? 'Actualizar' : 'Publicar producto'}
                  </button>
                  {editingProduct ? (
                    <button
                      className="icon-button border border-line"
                      onClick={cancelProductEdit}
                      type="button"
                    >
                      <Icon name="close" />
                    </button>
                  ) : null}
                </div>
              </form>

              <div className="card overflow-hidden">
                <div className="border-b border-line p-6">
                  <h2 className="font-display text-2xl font-semibold text-primary">
                    Productos publicados
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {products.length} registrados
                  </p>
                </div>
                <div className="divide-y divide-line">
                  {products.map((product) => (
                    <div
                      className="flex flex-wrap items-center gap-4 p-4"
                      key={product.id}
                    >
                      {product.imageUrl ? (
                        <img
                          alt=""
                          className="size-14 rounded-xl bg-panel object-cover"
                          src={product.imageUrl}
                        />
                      ) : (
                        <span className="grid size-14 place-items-center rounded-xl bg-panel text-primary">
                          <Icon name="restaurant" />
                        </span>
                      )}
                      <div className="min-w-44 flex-1">
                        <p className="font-bold text-primary">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted">
                          {product.productCategoryName}
                        </p>
                      </div>
                      <strong className="text-sm text-primary">
                        ${product.price.toFixed(2)}
                      </strong>
                      <span
                        className={`status-pill ${
                          product.isAvailable
                            ? 'bg-success/10 text-success'
                            : 'bg-danger/10 text-danger'
                        }`}
                      >
                        {product.isAvailable ? 'Disponible' : 'Agotado'}
                      </span>
                      <button
                        aria-label={`Editar ${product.name}`}
                        className="icon-button"
                        onClick={() => setEditingProduct(product)}
                        type="button"
                      >
                        <Icon name="edit" />
                      </button>
                      <button
                        aria-label={`Eliminar ${product.name}`}
                        className="icon-button text-danger"
                        onClick={() => deleteProduct(product)}
                        type="button"
                      >
                        <Icon name="delete" />
                      </button>
                    </div>
                  ))}
                  {!products.length ? (
                    <p className="p-8 text-center text-sm text-muted">
                      Aún no hay productos publicados.
                    </p>
                  ) : null}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
