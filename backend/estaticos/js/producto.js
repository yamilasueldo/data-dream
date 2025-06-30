import { carritoControl } from './carrito.js';

class Producto{
    id;
    nombre;
    categoria;
    precio;
    imagen;
    cantidad;
    estado;

    constructor(id, nombre, categoria, precio, imagen, cantidad, estado) {
        this.id = id;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
        this.imagen = imagen;
        this.cantidad = cantidad;
        this.estado = estado;
    }

    toJsonString() {
        return JSON.stringify(this);
    }

    static createFromJsonString(json) {
        const jsonParsed = JSON.parse(json);
        return new Producto(jsonParsed.id, jsonParsed.nombre, jsonParsed.categoria, jsonParsed.precio, jsonParsed.imagen, jsonParsed.cantidad, jsonParsed.estado);
    }

    createHtmlElement(control){
        const div = document.createElement("div");
        div.classList.add("card");

        const estaEnCarrito = carritoControl.Modelo.carrito.some(item => item.id === this.id);

        div.innerHTML = `
            <div class="card-image">
                <img src="${this.imagen}" alt="">
            </div>
            <div class="card-info flow">
                <h3 class="card-title">${this.nombre}</h3>
                <ul class="tag-list" role="list">
                    <li>${this.categoria}</li>
                </ul>
            </div>
            <div class="button-container" data-align="end" style="display: ${estaEnCarrito ? 'flex' : 'none'};">
                <button id="quitarBtn" class="button">Quitar</button>
            </div>
            <div class="button-container">
                <p class="card-price">$${this.precio}</p>
                <button id="agregarBtn" class="button">Agregar</button>
            </div>
        `;

        const btnAgregar = div.querySelector("#agregarBtn");
        btnAgregar.addEventListener("click", (e) => {
            e.preventDefault();
            this.agregarProducto();
            control.refrescarProductos();
        });

        const btnQuitar = div.querySelector("#quitarBtn");
        if (btnQuitar) {
            btnQuitar.addEventListener("click", (e) => {
                e.preventDefault();
                const productoEnCarrito = carritoControl.Modelo.carrito.find(p => p.id === this.id);
                
                if (!productoEnCarrito) {
                    alert("Este producto no está en el carrito.");
                    return;
                }

                if (productoEnCarrito.cantidad > 1) {
                    productoEnCarrito.cantidad--;
                } else {
                    carritoControl.Modelo.carrito = carritoControl.Modelo.carrito.filter(p => p.id !== this.id);
                }
                this.eliminarProducto();
                control.refrescarProductos();
                const nuevoElemento = this.createHtmlElement();
                div.replaceWith(nuevoElemento);
            });
        }

        return div;
    }

    agregarProducto(){
        const productoAgregado = {
            id: this.id,
            nombre: this.nombre,
            categoria: this.categoria,
            precio : this.precio,
            imagen: this.imagen,
            cantidad: this.cantidad
        };

        carritoControl.agregarAlCarrito(productoAgregado);
    }

    eliminarProducto(){
        carritoControl.eliminarDelCarrito(this.id);
    }
}

export { Producto };