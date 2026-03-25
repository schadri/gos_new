export type PositionDef = {
    category: string;
    items: string[];
}

export const POSITIONS: PositionDef[] = [
    {
        category: "Cocina",
        items: [
            "Chef Ejecutivo", "Chef de Cocina", "Sous Chef",
            "Cocinero", "Sushiman", "Pizzero", "Parrillero", "Pastelero",
            "Panadero", "Ayudante de Cocina", "Bachero",
        ]
    },
    {
        category: "Servicio y Bebidas",
        items: [
            "Maitre", "Sommelier", "Bartender", "Barman", "Barista", "Host/Hostess", "Camarero",
            "Ayudante de Camarero", "Adicionista", "Recepcionista de Restaurant"
        ]
    },
    {
        category: "Hotelería",
        items: [
            "Gerente de Hotel", "Recepcionista",
            "Conserje", "Gobernanta", "Valet Parking",
            "Room Service",
        ]
    },
    {
        category: "Gestión",
        items: [
            "Gerente General", "Gerente de Restaurant", "Gerente de Restaurante",
            "Gerente de Operaciones", "Gerente de Alimentos y Bebidas",
            "Gerente Administrativo", "Subgerente", "Administrativo", "Encargado de Almacén",
            "Encargado de Compras"
        ]
    },
    {
        category: "Limpieza y Mantenimiento",
        items: [
            "Ama de Llaves", "Supervisor de Limpieza", "Empleada de Limpieza", "Steward", "Lavaplatos",
            "Limpieza de Restaurant", "Jefe de Mantenimiento", "Encargado de Mantenimiento"
        ]
    },
    {
        category: "Eventos",
        items: [
            "Coordinador de Eventos", "Banquetes", "Mozos de Eventos", "Bartender de Eventos"
        ]
    }
]
