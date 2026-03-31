'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddProducteur(){
    const [fullName, setName] = useState('');
    const [description, setDescription] = useState('');
    const [region, setRegion] = useState('');
    const [error, setError] = useState(false);
    const router = useRouter();

    const updateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(false);

        try{
            const res = await fetch('/api/admin/producteurs', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({fullName, description, region})
            });

            if(res.ok){
                router.push('/admin/dashboard')
                router.refresh();
                //pop up de confirmation
            }else{
                setError(true);
            }
        }catch(error){
            console.error("Erreur dans la modification du producteur : ", error);
            setError(true);
        }
    };

    const deletionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(false);

        try{
            const res = await fetch('/api/admin/producteurs', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if(res.ok){
                router.push('/admin/dashboard')
                router.refresh();
                //pop up de confirmation
            }else{
                setError(true);
            }
        }catch(error){
            console.error("Erreur dans la supression du producteur : ", error);
            setError(true);
        }
    }
}