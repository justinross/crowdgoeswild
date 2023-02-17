import {defineConfig} from 'vite';
export default defineConfig({
    publicDir: 'public',
    base: '/modules/crowdgoeswild/',
    server: {
        port: 31001,
        open: true,
        proxy: {
            '^(?!/modules/crowdgoeswild)': 'http://localhost:31000/',
            '/socket.io': {
                target: 'ws://localhost:31000',
                ws: true
            }
        }
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true,
        minify: false,
        rollupOptions: {
            external: ['/scripts/greensock/esm/all.js'],
            makeAbsoluteExternalsRelative: false,
            output: {
                globals: {
                    gsap: "gsap"
                }
            }
        },
        lib: {
            name: 'crowdgoeswild',
            entry: 'src/ts/scripts/crowdgoeswild.ts',
            formats: ['es'],
            fileName: 'crowdgoeswild'
        }
    }
})
