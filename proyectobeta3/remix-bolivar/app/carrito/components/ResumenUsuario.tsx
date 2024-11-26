interface Usuario {
    id: string;
    name: string;
    email: string;
    username: string;
}

interface ResumenUsuarioProps {
    usuario: Usuario;
}

export default function ResumenUsuario({ usuario }: ResumenUsuarioProps) {
    return (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
            <h3 className="text-lg font-semibold mb-3">Información del Comprador</h3>
            <div className="space-y-2">
                <p><span className="font-medium">Nombre:</span> {usuario.name}</p>
                <p><span className="font-medium">Email:</span> {usuario.email}</p>
                <p><span className="font-medium">Usuario:</span> {usuario.username}</p>
            </div>
        </div>
    );
} 