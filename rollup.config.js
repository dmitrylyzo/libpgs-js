import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from "@rollup/plugin-typescript";
import terser from '@rollup/plugin-terser';

const typescriptOptions = {
    compilerOptions: {
        lib: ["es2015", "dom"],
        target: "es5"
    }
};

const terserOptions = {
    module: true
};

export default [
    {
        input: 'src/libpgs.ts',
        output: {
            file: 'dist/libpgs.js',
            format: 'es'
        },
        plugins: [
            terser(terserOptions),
            typescript(typescriptOptions),
            commonjs(),
            resolve()
        ]
    },
    {
        input: 'src/worker.ts',
        output: {
            file: 'dist/libpgs.worker.js',
            format: 'es'
        },
        plugins: [
            terser(terserOptions),
            typescript(typescriptOptions),
            commonjs(),
            resolve()
        ]
    }
];
