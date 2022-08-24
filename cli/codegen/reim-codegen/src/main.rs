use std::fs::{read_to_string, write};

extern crate mustache;

pub mod abi;
mod parse_schema;

use abi::*;
use parse_schema::*;

fn main() -> Result<(), std::io::Error> {
    let schema = read_to_string("debug/in/schema.graphql")?;

    let mut parser = tree_sitter::Parser::new();
    parser.set_language(tree_sitter_wrap::language()).unwrap();
   
    let abi = parse_schema(schema);

    println!("{:?}", abi);

    for schema_type in &abi {
        match schema_type {
            SchemaType::Function(x) => render_function(x),
            SchemaType::Class(x) => render_class(x),
        };
    }

    let jsonAbi = serde_json::to_string_pretty(&abi).unwrap();
    write("debug/out/abi.json", &jsonAbi).unwrap();

    Ok(())
}

// fn main() -> Result<(), std::io::Error> {

//     // let abi_json = read_to_string("abi.json")?;
//     // let abi: Result<TypeInfo, serde_json::Error> = serde_json::from_str(&abi_json);
//     // match abi {
//     //     Ok(abi) => {
//     //         println!("{:?}", abi);
//     //         for schema_type in abi {
//     //             let output = match schema_type {
//     //                 SchemaType::Function(x) => render_function(x),
//     //                 SchemaType::Class(x) => render_class(x),
//     //             };
//     //         }
//     //         Ok(())
//     //     },
//     //     Err(e) => {
//     //         println!("{:?}", e);
//     //         Ok(())
//     //     }
//     // }
// }

pub fn render_class(class_type: &ClassType) {
    let template_str = read_to_string("debug/templates/class-wrapped.mustache").unwrap();

    let template = mustache::compile_str(&template_str).unwrap();

    match template.render_to_string(&class_type) {
        Ok(str) => {
            write(format!("debug/out/types/{}.ts", class_type.name), str.as_bytes()).unwrap()
        },
        _ => {}
    }
}

pub fn render_function(function_type: &FunctionType) {
    let template_str = read_to_string("debug/templates/function-wrapped.mustache").unwrap();

    let template = mustache::compile_str(&template_str).unwrap();

    match template.render_to_string(&function_type) {
        Ok(str) => {
            write(format!("debug/out/types/{}.ts", function_type.name), str.as_bytes()).unwrap()
        },
        _ => {}
    }
}