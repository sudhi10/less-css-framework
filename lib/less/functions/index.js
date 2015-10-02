//register functions
import "./default";
import "./color";
import "./color-blending";
import dataUriFactory from "./data-uri";
import "./math";
import "./number";
import "./string";
import svgFactory from "./svg";
import "./types";

import functionRegistry from "./function-registry";
import functionCaller from "./function-caller";

export default function(environment) {
    var functions = {
        functionRegistry: functionRegistry,
        functionCaller: functionCaller
    };

    dataUriFactory(environment);
    svgFactory(environment);

    return functions;
}
