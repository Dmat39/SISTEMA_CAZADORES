import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAllUsersApi } from '../../api/admin/userApi';
import { toast } from 'sonner';

const FilterUser = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const selectedUserId = searchParams.get('userId') || '';

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await getAllUsersApi();
                setUsers(response?.data || []);
            } catch (error: any) {
                console.error('Error fetching users:', error);
                toast.error(`Error al cargar los usuarios: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleUserChange = (event: any) => {
        const newUserId = event.target.value;
        const searchParams = new URLSearchParams(location.search);

        if (newUserId) {
            searchParams.set('userId', newUserId);
        } else {
            searchParams.delete('userId');
        }

        // Reset a página 1 cuando cambia el filtro
        searchParams.set('page', '1');

        navigate({ search: searchParams.toString() });
    };

    return (
        <div className="w-full sm:w-auto sm:min-w-[180px]">
            <FormControl size="small" variant="outlined" fullWidth>
                <InputLabel>Creador</InputLabel>
                <Select
                    value={selectedUserId}
                    onChange={handleUserChange}
                    label="Creador"
                    disabled={loading}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            height: '40px',
                            fontSize: '0.875rem'
                        }
                    }}
                >
                    <MenuItem value="">
                        <em>Todos los creadores</em>
                    </MenuItem>
                    {loading ? (
                        <MenuItem disabled>
                            <CircularProgress size={16} sx={{ marginRight: 1 }} />
                            Cargando...
                        </MenuItem>
                    ) : (
                        users.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                                {user.name && user.lastname ? `${user.name} ${user.lastname}` : user.username}
                            </MenuItem>
                        ))
                    )}
                </Select>
            </FormControl>
        </div>
    );
};

export default FilterUser;
