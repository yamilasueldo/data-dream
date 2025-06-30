import { Producto } from './producto.js'

class Modelo {
    Productos;

    constructor() {}
}

class Vista {
    ProductosContainer;

    constructor() {
        this.SeccionPrincipal = {
            divProductos: this.$("productos-container"),
            btnAnterior: this.$("anterior"),
            btnSiguiente: this.$("siguiente") 
        }
    }

    $(id){
        return document.getElementById(id);
    }

    // Mostrar loading
    mostrarCargando() {
        this.SeccionPrincipal.divProductos.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <p>Cargando productos...</p>
            </div>
        `;
    }

    // Mostrar error
    mostrarError(mensaje) {
        this.SeccionPrincipal.divProductos.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: red;">
                <p>Error: ${mensaje}</p>
            </div>
        `;
    }
}

class Control {
    Vista;
    Modelo;

    constructor(p_vista, p_modelo) {
        this.Modelo = p_modelo;
        this.Vista = p_vista;
        this.filtroActual = "todos"; 
        this.paginaActual = 1;
        this.productosPorPagina = 4;
        this.totalPaginas = 1;

        this.cargaInicial();

        document.getElementById("filtro-todos").addEventListener("click", () => {
            this.filtrarProductos("todos");
        });

        document.getElementById("filtro-ropa").addEventListener("click", () => {
            this.filtrarProductos("ropa");
        });

        document.getElementById("filtro-accesorios").addEventListener("click", () => {
            this.filtrarProductos("accesorios");
        });

        this.Vista.SeccionPrincipal.btnAnterior.addEventListener("click", () => {
            if (this.paginaActual > 1) {
                this.paginaActual--;
                this.cargarProductos();
            }
        });
        
        this.Vista.SeccionPrincipal.btnSiguiente.addEventListener("click", () => {
            if (this.paginaActual < this.totalPaginas) {
                this.paginaActual++;
                this.cargarProductos();
            }
        });
    }

    cargaInicial() {
        this.cargarProductos();
    }

    async cargarProductos() {
        try {
            this.Vista.mostrarCargando();

            // Construir parámetros de query
            const params = new URLSearchParams({
                pagina: this.paginaActual,
                limite: this.productosPorPagina,
                activo: 'true'
            });

            // Agregar filtro de categoría si no es "todos"
            if (this.filtroActual !== "todos") {
                params.append('categoria', this.filtroActual);
            }

            // Hacer petición a la API (endpoint en español)
            const response = await fetch(`/api/productos?${params}`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();

            // Adaptado a la nueva estructura de respuesta en español
            if (!data.exito) {
                throw new Error(data.mensaje || 'Error al cargar productos');
            }

            // Convertir datos de API a objetos Producto
            const productos = data.datos.productos.map(productoData => {
                return new Producto(
                    productoData.id,
                    productoData.nombre,
                    productoData.categoria,
                    productoData.precio,
                    productoData.imagen,
                    1, // cantidad por defecto
                    productoData.activo
                );
            });

            // Actualizar modelo y paginación
            this.Modelo.Productos = productos;
            this.totalPaginas = data.datos.paginacion.totalPaginas;
            
            // Actualizar vista
            this.actualizarVistaProductos(productos);
            this.actualizarBotonesPaginacion(data.datos.paginacion);

        } catch (error) {
            console.error("Error al cargar los productos:", error);
            this.Vista.mostrarError(error.message);
        }
    }

    actualizarVistaProductos(lista) {
        this.Vista.SeccionPrincipal.divProductos.innerHTML = "";

        if (lista.length === 0) {
            this.Vista.SeccionPrincipal.divProductos.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                    <p>No hay productos disponibles en esta categoría.</p>
                </div>
            `;
            return;
        }

        lista.forEach(producto => {
            const htmlElement = producto.createHtmlElement(this);
            this.Vista.SeccionPrincipal.divProductos.appendChild(htmlElement);
        });
    }

    actualizarBotonesPaginacion(paginacion) {
        this.Vista.SeccionPrincipal.btnAnterior.style.display = 
            paginacion.tieneAnterior ? 'inline-block' : 'none';
        
        this.Vista.SeccionPrincipal.btnSiguiente.style.display = 
            paginacion.tieneSiguiente ? 'inline-block' : 'none';

        // Actualizar texto de los botones para mostrar info de página
        this.Vista.SeccionPrincipal.btnAnterior.textContent = 
            `← Página ${paginacion.paginaActual - 1}`;
        
        this.Vista.SeccionPrincipal.btnSiguiente.textContent = 
            `Página ${paginacion.paginaActual + 1} →`;
    }

    filtrarProductos(categoria) {
        this.filtroActual = categoria;
        this.paginaActual = 1; // Resetear a primera página
        this.cargarProductos();

        // Actualizar UI de filtros
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const filtroId = categoria === 'todos' ? 'filtro-todos' : `filtro-${categoria}`;
        document.getElementById(filtroId)?.classList.add('active');
    }

    refrescarProductos() {
        this.cargarProductos();
    }
}

var modelo = new Modelo();
var vista = new Vista();
var control = new Control(vista, modelo);

/*import { Producto } from './producto.js'

class Modelo {
    Productos;

    constructor() {}
}

class Vista {
    ProductosContainer;

    constructor() {
        this.SeccionPrincipal = {
            divProductos: this.$("productos-container"),
            btnAnterior: this.$("anterior"),
            btnSiguiente: this.$("siguiente") 
        }
    }

    $(id){
        return document.getElementById(id);
    }
}

class Control {
    Vista;
    Modelo;

    constructor(p_vista, p_modelo) {
        this.Modelo = p_modelo;
        this.Vista = p_vista;
        this.filtroActual = "all"; 
        this.paginaActual = 1;
        this.productosPorPagina = 4;

        this.cargaInicial();

        document.getElementById("filtro-todos").addEventListener("click", () => {
            this.filterProducts("all");
        });

        document.getElementById("filtro-ropa").addEventListener("click", () => {
            this.filterProducts("ropa");
        });

        document.getElementById("filtro-accesorios").addEventListener("click", () => {
            this.filterProducts("accesorios");
        });

        this.Vista.SeccionPrincipal.btnAnterior.addEventListener("click", () => {
            if (this.paginaActual > 1) {
                this.paginaActual--;
                const filtrados = this.obtenerProductosFiltrados();
                this.actualizarVistaProductos(filtrados);
            }
        });
        
        this.Vista.SeccionPrincipal.btnSiguiente.addEventListener("click", () => {
            const filtrados = this.obtenerProductosFiltrados();
            const maxPaginas = Math.ceil(filtrados.length / this.productosPorPagina);
            if (this.paginaActual < maxPaginas) {
                this.paginaActual++;
                this.actualizarVistaProductos(filtrados);
            }
        });
    }

    cargaInicial() {
        this.Vista.SeccionPrincipal.divProductos.innerHTML = "";

        fetch("../../../Estaticos/js/productos.json")
        .then(res => res.json())
        .then(data => {
            let productos = data
            .filter(productoData => productoData.estado === true)
            .map(productoData => {
                return new Producto(
                    productoData.id,
                    productoData.nombre,
                    productoData.categoria,
                    productoData.precio,
                    productoData.imagen,
                    productoData.cantidad,
                    productoData.estado
                );
            })
            this.Modelo.Productos = productos;
            this.actualizarVistaProductos(productos);
        })
        .catch(error => {
            console.error("Error al cargar los productos:", error);
        })
        .finally(() => {
            console.log("Promesa finalizada");
        });
    }

    actualizarVistaProductos(lista) {
        this.Vista.SeccionPrincipal.divProductos.innerHTML = "";

        const inicio = (this.paginaActual - 1) * this.productosPorPagina;
        const fin = inicio + this.productosPorPagina;
        const productosPagina = lista.slice(inicio, fin);

        productosPagina.forEach(producto => {
            const htmlElement = producto.createHtmlElement(this);
            this.Vista.SeccionPrincipal.divProductos.appendChild(htmlElement);
        });

        this.Vista.SeccionPrincipal.btnAnterior.style.display = this.paginaActual === 1 ? 'none' : 'inline-block';
        this.Vista.SeccionPrincipal.btnSiguiente.style.display = fin >= lista.length ? 'none' : 'inline-block';
    }

    obtenerProductosFiltrados() {
        let productos = this.Modelo.Productos;
        return this.filtroActual === "all"
            ? productos.filter(p => p.estado === true)
            : productos.filter(p => p.categoria === this.filtroActual);
    }

    filterProducts(categoria) {
        this.filtroActual = categoria;
        this.paginaActual = 1;
        const filtrados = this.obtenerProductosFiltrados();
        this.actualizarVistaProductos(filtrados);
    }

    refrescarProductos() {
        const filtrados = this.obtenerProductosFiltrados();
        this.actualizarVistaProductos(filtrados);
    }
}

var modelo = new Modelo();
var vista = new Vista();
var control = new Control(vista, modelo);

*/