'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddProducteur(){
    const [fullName, setName] = useState('');
    const [description, setDescription] = useState('');
    const [region, setRegion] = useState('');
    const [error, setError] = useState(false);
    const router = useRouter();

    const addSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(false);

        try{
            const res = await fetch('/api/admin/producteurs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({fullName, description, region})
            });

            if(res.ok){



            }else{setError(true);}
        }catch(error){
            console.error("Erreur dans l'ajout du producteur : ", error);
            setError(true);
        }
    };
}