import { useCallback, useEffect, useState } from 'react';
export const loadImage = (path: string): Promise<HTMLImageElement> =>
    new Promise((res, rej) => {
        const img = new Image();
        img.src = path;
        img.onload = () => res(img);
        img.onerror = rej;
    });

export async function getShaderSrc(path: string): Promise<string> {
    try {
        const response = await fetch(`/assets/shaders/${path}`, {
            cache: "no-cache"
        });

        return response.text();
    } catch {
        throw new Error(`Failed to retrieve shader ${path}`);
    }
}
