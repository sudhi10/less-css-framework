@{%
  function sel(match, indices) {
    return match.map(function(m) {
      var arr = [];
        indices.forEach(function(i) {
          arr.push(m[i]);
        });
        return arr;
    });
  }
%}
Stylesheet
 -> _ Root:* _ 

Root
 -> _ Comment _
  | _ Ruleset _
  | _ MixinDefinition _
  | _ VariableDefinition _ (";" (_ Root _):?):?
  | _ AtRule _ (";" (_ Root _):?):? 
  | _ MixinCall _ (";" (_ Root _):?):?
     
Primary
 -> _ Rule _ (";" (_ Primary _):?):?
  | _ Root _

AtRule
 -> "@" Ident _ [^{;]:* _ Block:?  # need arguments etc
  
# these need semi-colon separators
Rule   
 -> Declaration | MixinCall | VariableDefinition | AtRule # | RulesetCall

Ruleset
 -> Comment:? _ SelectorList _ Block

Block
 -> "{" _ Primary:* _ "}"
    
SelectorList
 -> Selector:* (_ "," _ Selector:*):* Guard:?

MixinDefinition
 -> ClassOrId _ "(" Args:? ")" _ Block

Selector
 -> Element:? _ Comment:? _ (Combinator _ Selector _)
   | Element __ Selector
   | Element _ Comment:? 
   
# Elements
Class 
 -> "." Ident

Id
 -> "#" Ident

Element 
 -> Class | Id | Ident | Attr | "&" | Pseudo | "*"

Combinator
 -> ">" | "+" | "~" | "|" | "/" Ident "/" | ">>" | "||" | ">>>"      # Current CSS4 combinators on the end

Attr
 -> "[" Ident ([|~*$^]:? "=" (Quoted | [^\]]:+)):? (_ "i"):? "]"

Pseudo
 -> ":" ":":? Ident ("(" [^)]:* ")"):?

Extend
 -> ":extend(" _ SelectorList (__ ExtendKeys):? ")"

ExtendKeys
 -> "!":? ("all" | "deep" | "ALL" | "DEEP")

ClassOrId 
 -> Class | Id

MixinName -> ClassOrId

Declaration
 -> Ident _ ":" _ Value 

VariableDefinition
 -> Variable _ ":" _ Block 
 | Variable _ ":" _ Value 

Value
 -> Entity (_ ",":? _ Entity):* _ ("!" _ "important"):?

NonCommaValue
 -> Entity (_ Entity):* _ ("!" _ "important"):?

# ENTITIES
Entity
 -> Expression
  | Comment   
  | Literal
  | Url
  | Keyword
  | "/"
  | Javascript

  Literal
   -> Quoted
    | UnicodeDescriptor
  
  ExpressionParts
   -> Unit
    | FunctionCall
    | Color
    | Variable
    | PropReference
 
  Quoted
   -> "\"" ([^\"\n\r] | "\\\"" ):* "\""
     | "'" ([^\'\n\r] | "\\'"):* "'"

  Num        -> (Int:? "."):? Int
  Percentage -> Num "%"
  Dimension  -> Num Ident
  Unit       -> Num ("%" | Ident):?
  Keyword    -> [_A-Za-z-] [A-Za-z0-9_-]:*

  ExpressionContainer
   -> "(" _ Expression _ ")"
  Expression 
   -> ExpressionContainer (_ Operator _ Expression):? | ExpressionParts (_ Operator _ Expression):?
 
    
  FunctionCall
   -> (Ident | "%") "(" Args ")" 
    | "progid:" [^(]:* "(" Assignment ")"

  Assignment
   -> Keyword "=" Value 

  Url
   -> "url(" _ (Quoted | [^)]:*) _ ")"     # -- need to extract the url

  Prop -> PropReference | PropReferenceCurly
  Var -> Variable | VariableCurly
  Interpolator -> VariableCurly | PropReferenceCurly

  PropReference
   -> "$" Ident

  PropReferenceCurly
   -> "${" _ Namespace:? _ Ident _ "}"  # -- TODO: namespacing needs to be optional

  Variable
   -> "@" "@":? [A-Za-z0-9_-]:+

  VariableCurly
   -> "@{" _ Namespace:? _ "@":? [\w-]:+ _ "}"

  Color
   -> "#" Hex3 Hex3:?

  UnicodeDescriptor
   -> "U+" [0-9a-fA-F?]:+ ("-" [0-9a-fA-F?]:+):?

  Javascript
   -> "~":? "`" [^`]:* "`"

MixinCall
 -> ClassOrId _ ">":? _ MixinCall
  | MixinName ("(" Args:? ")"):?

Args
 -> CommaArgument _ ("," _ CommaArgument):*
 | SemiColonArgument _ (";" _ SemiColonArgument _ ):* ";":?

CommaArgument
 -> Variable (_ ":" _ NonCommaValue)
  | NonCommaValue
  | "..."

SemiColonArgument
 -> CommaArgument
 | Value

# TEMP
Namespace -> "5"
Guard -> "6"


Ident
 -> NameStart NameChar:*
   # | ident:? variableCurly ident:?  # not sure how to do this

# Primitives
Operator
 -> "*" | "+" | "-" | "/"
Int
 -> [0-9]:+  
Hex3
 -> Hex Hex Hex
Hex
 -> [a-fA-F0-9]
NameStart
 -> [a-zA-Z_-] | NonAscii | Escape 
NameChar
 -> [A-Za-z0-9_-] | NonAscii | Escape 
NonAscii
 -> [\u0080-\uD7FF\uE000-\uFFFD]
Escape
 -> Unicode | "\\" [\u0020-\u007E\u0080-\uD7FF\uE000-\uFFFD]
Unicode
 -> "\\" Hex:+ _:?


# Whitespace
_  -> __:?
__ -> [ \t\r\n\f]:+

Comment
 -> "//" [^\n\r]:* 
   | "/*" CommentChars:* "*/" 
        
CommentChars
 -> "*" [^/] 
   | [^*]

