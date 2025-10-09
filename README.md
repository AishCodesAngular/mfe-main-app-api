# HostApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.17.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Angular App Creation: 
npx -p @angular/cli@17 ng new host-app --no-standalone --routing --style=scss

## Ng Serve:
ng serve --host 0.0.0.0 --port 4200

## install (Angular element):
npm install @angular/elements@17 @webcomponents/custom-elements

@angular/elements@17 → the version aligned with Angular 17.

@webcomponents/custom-elements → polyfill for browsers that don’t natively support Custom Elements (safe to add).

## Zone update:
npm uninstall zone.js
npm install zone.js@0.13

## Polyfill config:
build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "outputHashing": "none",
            "outputPath": "dist/user-management-mfe",
            "namedChunks": false,
            "vendorChunk": false,
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": [
              "zone.js"
            ],

## ng Build:
ng build --configuration production --output-hashing=none

## MFE Bundle concade:
cat runtime.js polyfills.js main.js > ./../../elements/user-management-mfe.js

## Prod Deployment:
Step1: npm run deploy:gh 

Step2: update in index.html

Step3: npx angular-cli-ghpages --dir=dist/host-app/browser


