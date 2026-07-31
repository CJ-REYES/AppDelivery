# Manual de usuario

## 1. Acceso general

1. Abrir la página principal.
2. Seleccionar iniciar sesión o crear cuenta.
3. Ingresar correo y contraseña.
4. La sesión se renueva automáticamente mientras el refresh token sea válido.

## 2. Cliente

### Explorar y comprar

1. Entrar a `/inicio` o `/buscar`.
2. Filtrar comercios o consultar su catálogo.
3. Abrir un producto, seleccionar cantidad y agregar al carrito.
4. Ir a `/checkout`.
5. Seleccionar o registrar una dirección con ubicación.
6. Seleccionar o registrar un método de pago enmascarado.
7. Confirmar el pedido.

El sistema recalcula precios, cargos e inventario en el backend. El pago queda registrado como flujo simulado; no se realiza un cargo real.

### Consultar pedidos

1. Abrir `/pedidos`.
2. Revisar pedidos activos e historial.
3. Cancelar únicamente cuando el estado todavía lo permite.
4. Pulsar **Seguir pedido** para abrir `/seguimiento/:orderId`.

### Seguimiento

La vista presenta:

- Estado actual.
- Historial de estados.
- Comercio y dirección de entrega.
- Repartidor asignado cuando existe.
- Ruta y ubicación actualizada.

SignalR actualiza la vista y una consulta periódica funciona como respaldo.

### Perfil

En `/perfil` se puede:

- Editar nombre y teléfono.
- Crear, modificar, eliminar y seleccionar dirección predeterminada.
- Revisar opciones de seguridad.
- Acceder al registro de comercio o repartidor.

## 3. Comercio

### Registro

1. Iniciar sesión como usuario.
2. Abrir `/registro-comercio`.
3. Capturar información, categoría, horario, datos de contacto y ubicación.
4. Guardar.
5. La sesión se renueva para obtener el rol `Merchant`.

### Catálogo

En `/mi-comercio/productos`:

- Crear y editar categorías.
- Crear y editar productos.
- Definir precio, descripción, imagen, stock y disponibilidad.
- Desactivar elementos que ya no se ofrecen.

### Pedidos

En `/mi-comercio/pedidos`:

1. Consultar pedidos recibidos.
2. Confirmar el pedido.
3. Marcarlo en preparación.
4. Marcarlo listo para recolección.

Ese último estado permite que aparezca para repartidores elegibles.

## 4. Repartidor

### Registro

1. Abrir `/registro-repartidor`.
2. Crear cuenta o utilizar una cuenta autenticada.
3. Capturar vehículo, placa, licencia y documentación solicitada.
4. Renovar sesión para obtener el rol `Driver`.

### Disponibilidad y ubicación

1. Abrir `/repartidor`.
2. Permitir ubicación del navegador.
3. Cambiar a estado disponible.
4. Revisar entregas sugeridas.

### Entrega

1. Aceptar una entrega.
2. Abrir `/repartidor/entrega-activa`.
3. Seguir la ruta al comercio.
4. Cambiar el estado al recoger el pedido.
5. Seguir la ruta al cliente.
6. Marcar la entrega como completada.

### Historial y perfil

- `/repartidor/historial`: entregas y resumen de ganancias calculadas.
- `/repartidor/perfil`: datos personales y del vehículo.

## 5. Mensajes de interfaz

Las páginas muestran estados diferenciados:

- **Cargando**: se está consultando la API.
- **Error**: la solicitud falló o el usuario no tiene acceso.
- **Vacío**: no existen comercios, productos, pedidos o entregas aplicables.
- **Acceso redirigido**: falta autenticación o el rol requerido.

## 6. Cierre de sesión

Usar la opción de cerrar sesión. El backend revoca la sesión renovable y el frontend elimina el access token almacenado en `sessionStorage`.
