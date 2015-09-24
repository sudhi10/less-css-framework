import * as data from './data/index';
import * as tree from './tree/index';
import Environment from './environment/environment';
import AbstractFileManager from "./environment/abstract-file-manager";
import * as visitors from './visitors/index';
import Parser from './parser/parser';
import functionsFactory from './functions/index';
import * as contexts from './contexts';
import sourceMapOutputFactory from './source-map-output';
import sourceMapBuilderFactory from './source-map-builder';
import parseTreeFactory from './parse-tree';
import importManagerFactory from './import-manager';
import renderFactory from './render';
import parseFactory from './parse';
import LessError from './less-error';
import transformTree from './transform-tree';
import * as utils from './utils';
import logger from './logger';
import PluginManager from './plugin-manager';

export default function(environment, fileManagers) {
    var SourceMapOutput, SourceMapBuilder, ParseTree, ImportManager, Environment;

    var less = {
        version: [2, 5, 2],
        data: data,
        tree: tree,
        Environment: Environment,
        AbstractFileManager: AbstractFileManager,
        environment: (environment = new Environment(environment, fileManagers)),
        visitors: visitors,
        Parser: Parser,
        functions: functionsFactory(environment),
        contexts: contexts,
        SourceMapOutput: (SourceMapOutput = sourceMapOutputFactory(environment)),
        SourceMapBuilder: (SourceMapBuilder = sourceMapBuilderFactory(SourceMapOutput, environment)),
        ParseTree: (ParseTree = parseTreeFactory(SourceMapBuilder)),
        ImportManager: (ImportManager = importManagerFactory(environment)),
        render: renderFactory(environment, ParseTree, ImportManager),
        parse: parseFactory(environment, ParseTree, ImportManager),
        LessError: LessError,
        transformTree: transformTree(),
        utils: utils,
        PluginManager: PluginManager,
        logger: logger
    };

    return less;
};
