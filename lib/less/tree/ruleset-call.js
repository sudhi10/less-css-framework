import Node from "./node";
import Variable from "./variable";

export default function RulesetCall(variable) {
    this.variable = variable;
};
RulesetCall.prototype = new Node();
RulesetCall.prototype.type = "RulesetCall";
RulesetCall.prototype.eval = function (context) {
    var detachedRuleset = new Variable(this.variable).eval(context);
    return detachedRuleset.callEval(context);
};
