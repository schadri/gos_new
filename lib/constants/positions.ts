export type PositionDef = {
    category: string;
    items: string[];
}

export const POSITIONS: PositionDef[] = [
    {
        category: "Cocina",
        items: [
            "Chef Ejecutivo", "Chef de Cocina", "Sous Chef", "Chef de Partie",
            "Cocinero", "Sushiman", "Pizzero", "Parrillero", "Pastelero",
            "Panadero", "Ayudante de Cocina", "Bachero"
        ]
    },
    {
        category: "Servicio y Bebidas",
        items: [
            "Sommelier", "Bartender", "Barman", "Barista", "Camarero",
            "Mozo", "Capitán de Meseros", "Maitre", "Host/Hostess",
            "Ayudante de Camarero", "Adicionista", "Recepcionista de Restaurant"
        ]
    },
    {
        category: "Hotelería",
        items: [
            "Gerente de Hotel", "Recepcionista", "Recepcionista de Hotel",
            "Jefe de Recepción", "Conserje", "Botones", "Valet Parking",
            "Room Service"
        ]
    },
    {
        category: "Gestión",
        items: [
            "Gerente General", "Gerente de Restaurant", "Gerente de Restaurante",
            "Gerente de Operaciones", "Gerente de Alimentos y Bebidas",
            "Gerente Administrativo", "Subgerente", "Encargado de Almacén",
            "Comprador"
        ]
    },
    {
        category: "Limpieza y Mantenimiento",
        items: [
            "Ama de Llaves", "Supervisor de Limpieza", "Steward", "Lavaplatos",
            "Limpieza de Restaurant", "Jefe de Mantenimiento", "Encargado de Mantenimiento"
        ]
    },
    {
        category: "Eventos",
        items: [
            "Coordinador de Eventos", "Banquetes"
        ]
    }
]
