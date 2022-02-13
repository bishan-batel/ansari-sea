export function plane(detail: number) {
    const verticies = [];
    const indicies = [];

    for (let dx = 0; dx < detail; dx++) {
        let x = 2 * (dx / detail) - 1;
        for (let dy = 0; dy < detail; dy++) {
            let y = 2 * (dy / detail) - 1;

            verticies.push(x);
            verticies.push(y);
            verticies.push(0);
            verticies.push(dx / detail);
            verticies.push(dy / detail);
        }
    }

    const index = (x: number, y: number) => x + detail * y;

    for (let x = 0; x < detail - 1; x++) {
        for (let y = 0; y < detail - 1; y++) {
            indicies.push(index(x, y));
            indicies.push(index(x, y + 1));
            indicies.push(index(x + 1, y));
            indicies.push(index(x + 1, y));
            indicies.push(index(x, y + 1));
            indicies.push(index(x + 1, y + 1));
        }
    }

    return [verticies, indicies];
}