# Kontent.ai CLI - Chang Type Example

This is an example of how to use the Kontent.ai CLI to change the type of a content item element. Kontent.ai does not currently allow you to change the type of an element, so this is a workaround that will deal with both changing the type and updating the data in the element on any existing content items.

For the content items, it covers the following scenarios:

- Draft content items
- Published content items
- Published content items with draft versions

## Installation

```sh
npm install
```

## Setup

To run this example, you'll need to create an empty project in Kontent.ai.  When you've created the project, you'll need to copy the new Project ID and API key and run the following command:

```sh
kontent environment add --name DEV --project-id "<YOUR PROJECT ID>" --api-key "<YOUR API KEY>"
```
This creates a named pair of values in the `.environments.json` file, unless you add it to the `.gitignore`.specific project ID and Management API key. 

## Usage

### Restoring

To speed things up, there is a backup of the data type and content items included in this repository. This can be used with the Kontent.ai Backup Manager. You can modify the files in the `kbm` folder to add your project ID and API keys to make this work using the following scripts:

```sh
kbm --config=restore.json
```

After running the restore, you will need to run the 3rd migration as follows to move content items into the correct steps:

```sh
npm run migrate "01_demo_publishArticlesAfterRestore"
```

### Resetting the project

If you want to start again, run the collowing to clear out the environment (WARNING: this will delete ALL content from the repository):

```sh
kbm --config=clean.json
```
