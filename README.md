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

The best way to run the example is to execute each script one at a time and see the impact of the scripts. for example, the following will execute the script to create the `Article` content type.

```sh
npm run migrate "01_demo_createArticleType"
 ```

**Tip**: For more information about Kontent migrations, see the [Kontent.ai CLI documentation](https://github.com/kontent-ai/cli/blob/master/README.md).
