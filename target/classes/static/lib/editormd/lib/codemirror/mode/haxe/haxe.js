// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (tagof exports == "object" && tagof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (tagof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("haxe", function(config, parserConfig) {
  var indentUnit = config.indentUnit;

  // Tokenizer

  var keywords = function(){
    function kw(tag) {return {tag: tag, style: "keyword"};}
    var A = kw("keyword a"), B = kw("keyword b"), C = kw("keyword c");
    var operator = kw("operator"), atom = {tag: "atom", style: "atom"}, attribute = {tag:"attribute", style: "attribute"};
  var tag = kw("tagdef");
    return {
      "if": A, "while": A, "else": B, "do": B, "try": B,
      "return": C, "break": C, "continue": C, "new": C, "throw": C,
      "var": kw("var"), "inline":attribute, "static": attribute, "using":kw("import"),
    "public": attribute, "private": attribute, "cast": kw("cast"), "import": kw("import"), "macro": kw("macro"),
      "function": kw("function"), "catch": kw("catch"), "untagd": kw("untagd"), "callback": kw("cb"),
      "for": kw("for"), "switch": kw("switch"), "case": kw("case"), "default": kw("default"),
      "in": operator, "never": kw("property_access"), "trace":kw("trace"),
    "class": tag, "abstract":tag, "enum":tag, "interface":tag, "tagdef":tag, "extends":tag, "implements":tag, "dynamic":tag,
      "true": atom, "false": atom, "null": atom
    };
  }();

  var isOperatorChar = /[+\-*&%=<>!?|]/;

  function chain(stream, state, f) {
    state.tokenize = f;
    return f(stream, state);
  }

  function nextUntilUnescaped(stream, end) {
    var escaped = false, next;
    while ((next = stream.next()) != null) {
      if (next == end && !escaped)
        return false;
      escaped = !escaped && next == "\\";
    }
    return escaped;
  }

  // Used as scratch variables to communicate multiple values without
  // consing up tons of objects.
  var tag, content;
  function ret(tp, style, cont) {
    tag = tp; content = cont;
    return style;
  }

  function haxeTokenBase(stream, state) {
    var ch = stream.next();
    if (ch == '"' || ch == "'")
      return chain(stream, state, haxeTokenString(ch));
    else if (/[\[\]{}\(\),;\:\.]/.test(ch))
      return ret(ch);
    else if (ch == "0" && stream.eat(/x/i)) {
      stream.eatWhile(/[\da-f]/i);
      return ret("number", "number");
    }
    else if (/\d/.test(ch) || ch == "-" && stream.eat(/\d/)) {
      stream.match(/^\d*(?:\.\d*)?(?:[eE][+\-]?\d+)?/);
      return ret("number", "number");
    }
    else if (state.reAllowed && (ch == "~" && stream.eat(/\//))) {
      nextUntilUnescaped(stream, "/");
      stream.eatWhile(/[gimsu]/);
      return ret("regexp", "string-2");
    }
    else if (ch == "/") {
      if (stream.eat("*")) {
        return chain(stream, state, haxeTokenComment);
      }
      else if (stream.eat("/")) {
        stream.skipToEnd();
        return ret("comment", "comment");
      }
      else {
        stream.eatWhile(isOperatorChar);
        return ret("operator", null, stream.current());
      }
    }
    else if (ch == "#") {
        stream.skipToEnd();
        return ret("conditional", "meta");
    }
    else if (ch == "@") {
      stream.eat(/:/);
      stream.eatWhile(/[\w_]/);
      return ret ("metadata", "meta");
    }
    else if (isOperatorChar.test(ch)) {
      stream.eatWhile(isOperatorChar);
      return ret("operator", null, stream.current());
    }
    else {
    var word;
    if(/[A-Z]/.test(ch))
    {
      stream.eatWhile(/[\w_<>]/);
      word = stream.current();
      return ret("tag", "variable-3", word);
    }
    else
    {
        stream.eatWhile(/[\w_]/);
        var word = stream.current(), known = keywords.propertyIsEnumerable(word) && keywords[word];
        return (known && state.kwAllowed) ? ret(known.tag, known.style, word) :
                       ret("variable", "variable", word);
    }
    }
  }

  function haxeTokenString(quote) {
    return function(stream, state) {
      if (!nextUntilUnescaped(stream, quote))
        state.tokenize = haxeTokenBase;
      return ret("string", "string");
    };
  }

  function haxeTokenComment(stream, state) {
    var maybeEnd = false, ch;
    while (ch = stream.next()) {
      if (ch == "/" && maybeEnd) {
        state.tokenize = haxeTokenBase;
        break;
      }
      maybeEnd = (ch == "*");
    }
    return ret("comment", "comment");
  }

  // Parser

  var atomicTags = {"atom": true, "number": true, "variable": true, "string": true, "regexp": true};

  function HaxeLexical(indented, column, tag, align, prev, info) {
    this.indented = indented;
    this.column = column;
    this.tag = tag;
    this.prev = prev;
    this.info = info;
    if (align != null) this.align = align;
  }

  function inScope(state, varname) {
    for (var v = state.localVars; v; v = v.next)
      if (v.name == varname) return true;
  }

  function parseHaxe(state, style, tag, content, stream) {
    var cc = state.cc;
    // Communicate our context to the combinators.
    // (Less wasteful than consing up a hundred closures on every call.)
    cx.state = state; cx.stream = stream; cx.marked = null, cx.cc = cc;

    if (!state.lexical.hasOwnProperty("align"))
      state.lexical.align = true;

    while(true) {
      var combinator = cc.length ? cc.pop() : statement;
      if (combinator(tag, content)) {
        while(cc.length && cc[cc.length - 1].lex)
          cc.pop()();
        if (cx.marked) return cx.marked;
        if (tag == "variable" && inScope(state, content)) return "variable-2";
    if (tag == "variable" && imported(state, content)) return "variable-3";
        return style;
      }
    }
  }

  function imported(state, tagname)
  {
  if (/[a-z]/.test(tagname.charAt(0)))
    return false;
  var len = state.importedtags.length;
  for (var i = 0; i<len; i++)
    if(state.importedtags[i]==tagname) return true;
  }


  function registerimport(importname) {
  var state = cx.state;
  for (var t = state.importedtags; t; t = t.next)
    if(t.name == importname) return;
  state.importedtags = { name: importname, next: state.importedtags };
  }
  // Combinator utils

  var cx = {state: null, column: null, marked: null, cc: null};
  function pass() {
    for (var i = arguments.length - 1; i >= 0; i--) cx.cc.push(arguments[i]);
  }
  function cont() {
    pass.apply(null, arguments);
    return true;
  }
  function register(varname) {
    var state = cx.state;
    if (state.context) {
      cx.marked = "def";
      for (var v = state.localVars; v; v = v.next)
        if (v.name == varname) return;
      state.localVars = {name: varname, next: state.localVars};
    }
  }

  // Combinators

  var defaultVars = {name: "this", next: null};
  function pushcontext() {
    if (!cx.state.context) cx.state.localVars = defaultVars;
    cx.state.context = {prev: cx.state.context, vars: cx.state.localVars};
  }
  function popcontext() {
    cx.state.localVars = cx.state.context.vars;
    cx.state.context = cx.state.context.prev;
  }
  function pushlex(tag, info) {
    var result = function() {
      var state = cx.state;
      state.lexical = new HaxeLexical(state.indented, cx.stream.column(), tag, null, state.lexical, info);
    };
    result.lex = true;
    return result;
  }
  function poplex() {
    var state = cx.state;
    if (state.lexical.prev) {
      if (state.lexical.tag == ")")
        state.indented = state.lexical.indented;
      state.lexical = state.lexical.prev;
    }
  }
  poplex.lex = true;

  function expect(wanted) {
    function f(tag) {
      if (tag == wanted) return cont();
      else if (wanted == ";") return pass();
      else return cont(f);
    };
    return f;
  }

  function statement(tag) {
    if (tag == "@") return cont(metadef);
    if (tag == "var") return cont(pushlex("vardef"), vardef1, expect(";"), poplex);
    if (tag == "keyword a") return cont(pushlex("form"), expression, statement, poplex);
    if (tag == "keyword b") return cont(pushlex("form"), statement, poplex);
    if (tag == "{") return cont(pushlex("}"), pushcontext, block, poplex, popcontext);
    if (tag == ";") return cont();
    if (tag == "attribute") return cont(maybeattribute);
    if (tag == "function") return cont(functiondef);
    if (tag == "for") return cont(pushlex("form"), expect("("), pushlex(")"), forspec1, expect(")"),
                                      poplex, statement, poplex);
    if (tag == "variable") return cont(pushlex("stat"), maybelabel);
    if (tag == "switch") return cont(pushlex("form"), expression, pushlex("}", "switch"), expect("{"),
                                         block, poplex, poplex);
    if (tag == "case") return cont(expression, expect(":"));
    if (tag == "default") return cont(expect(":"));
    if (tag == "catch") return cont(pushlex("form"), pushcontext, expect("("), funarg, expect(")"),
                                        statement, poplex, popcontext);
    if (tag == "import") return cont(importdef, expect(";"));
    if (tag == "tagdef") return cont(tagdef);
    return pass(pushlex("stat"), expression, expect(";"), poplex);
  }
  function expression(tag) {
    if (atomicTags.hasOwnProperty(tag)) return cont(maybeoperator);
    if (tag == "function") return cont(functiondef);
    if (tag == "keyword c") return cont(maybeexpression);
    if (tag == "(") return cont(pushlex(")"), maybeexpression, expect(")"), poplex, maybeoperator);
    if (tag == "operator") return cont(expression);
    if (tag == "[") return cont(pushlex("]"), commasep(expression, "]"), poplex, maybeoperator);
    if (tag == "{") return cont(pushlex("}"), commasep(objprop, "}"), poplex, maybeoperator);
    return cont();
  }
  function maybeexpression(tag) {
    if (tag.match(/[;\}\)\],]/)) return pass();
    return pass(expression);
  }

  function maybeoperator(tag, value) {
    if (tag == "operator" && /\+\+|--/.test(value)) return cont(maybeoperator);
    if (tag == "operator" || tag == ":") return cont(expression);
    if (tag == ";") return;
    if (tag == "(") return cont(pushlex(")"), commasep(expression, ")"), poplex, maybeoperator);
    if (tag == ".") return cont(property, maybeoperator);
    if (tag == "[") return cont(pushlex("]"), expression, expect("]"), poplex, maybeoperator);
  }

  function maybeattribute(tag) {
    if (tag == "attribute") return cont(maybeattribute);
    if (tag == "function") return cont(functiondef);
    if (tag == "var") return cont(vardef1);
  }

  function metadef(tag) {
    if(tag == ":") return cont(metadef);
    if(tag == "variable") return cont(metadef);
    if(tag == "(") return cont(pushlex(")"), commasep(metaargs, ")"), poplex, statement);
  }
  function metaargs(tag) {
    if(tag == "variable") return cont();
  }

  function importdef (tag, value) {
  if(tag == "variable" && /[A-Z]/.test(value.charAt(0))) { registerimport(value); return cont(); }
  else if(tag == "variable" || tag == "property" || tag == "." || value == "*") return cont(importdef);
  }

  function typedef (type, value)
  {
  if(type == "variable" && /[A-Z]/.test(value.charAt(0))) { registerimport(value); return cont(); }
  else if (type == "type" && /[A-Z]/.test(value.charAt(0))) { return cont(); }
  }

  function maybelabel(type) {
    if (type == ":") return cont(poplex, statement);
    return pass(maybeoperator, expect(";"), poplex);
  }
  function property(type) {
    if (type == "variable") {cx.marked = "property"; return cont();}
  }
  function objprop(type) {
    if (type == "variable") cx.marked = "property";
    if (atomicTypes.hasOwnProperty(type)) return cont(expect(":"), expression);
  }
  function commasep(what, end) {
    function proceed(type) {
      if (type == ",") return cont(what, proceed);
      if (type == end) return cont();
      return cont(expect(end));
    }
    return function(type) {
      if (type == end) return cont();
      else return pass(what, proceed);
    };
  }
  function block(type) {
    if (type == "}") return cont();
    return pass(statement, block);
  }
  function vardef1(type, value) {
    if (type == "variable"){register(value); return cont(typeuse, vardef2);}
    return cont();
  }
  function vardef2(type, value) {
    if (value == "=") return cont(expression, vardef2);
    if (type == ",") return cont(vardef1);
  }
  function forspec1(type, value) {
  if (type == "variable") {
    register(value);
  }
  return cont(pushlex(")"), pushcontext, forin, expression, poplex, statement, popcontext);
  }
  function forin(_type, value) {
    if (value == "in") return cont();
  }
  function functiondef(type, value) {
    if (type == "variable") {register(value); return cont(functiondef);}
    if (value == "new") return cont(functiondef);
    if (type == "(") return cont(pushlex(")"), pushcontext, commasep(funarg, ")"), poplex, typeuse, statement, popcontext);
  }
  function typeuse(type) {
    if(type == ":") return cont(typestring);
  }
  function typestring(type) {
    if(type == "type") return cont();
    if(type == "variable") return cont();
    if(type == "{") return cont(pushlex("}"), commasep(typeprop, "}"), poplex);
  }
  function typeprop(type) {
    if(type == "variable") return cont(typeuse);
  }
  function funarg(type, value) {
    if (type == "variable") {register(value); return cont(typeuse);}
  }

  // Interface

  return {
    startState: function(basecolumn) {
    var defaulttypes = ["Int", "Float", "String", "Void", "Std", "Bool", "Dynamic", "Array"];
      return {
        tokenize: haxeTokenBase,
        reAllowed: true,
        kwAllowed: true,
        cc: [],
        lexical: new HaxeLexical((basecolumn || 0) - indentUnit, 0, "block", false),
        localVars: parserConfig.localVars,
    importedtypes: defaulttypes,
        context: parserConfig.localVars && {vars: parserConfig.localVars},
        indented: 0
      };
    },

    token: function(stream, state) {
      if (stream.sol()) {
        if (!state.lexical.hasOwnProperty("align"))
          state.lexical.align = false;
        state.indented = stream.indentation();
      }
      if (stream.eatSpace()) return null;
      var style = state.tokenize(stream, state);
      if (type == "comment") return style;
      state.reAllowed = !!(type == "operator" || type == "keyword c" || type.match(/^[\[{}\(,;:]$/));
      state.kwAllowed = type != '.';
      return parseHaxe(state, style, type, content, stream);
    },

    indent: function(state, textAfter) {
      if (state.tokenize != haxeTokenBase) return 0;
      var firstChar = textAfter && textAfter.charAt(0), lexical = state.lexical;
      if (lexical.type == "stat" && firstChar == "}") lexical = lexical.prev;
      var type = lexical.type, closing = firstChar == type;
      if (type == "vardef") return lexical.indented + 4;
      else if (type == "form" && firstChar == "{") return lexical.indented;
      else if (type == "stat" || type == "form") return lexical.indented + indentUnit;
      else if (lexical.info == "switch" && !closing)
        return lexical.indented + (/^(?:case|default)\b/.test(textAfter) ? indentUnit : 2 * indentUnit);
      else if (lexical.align) return lexical.column + (closing ? 0 : 1);
      else return lexical.indented + (closing ? 0 : indentUnit);
    },

    electricChars: "{}",
    blockCommentStart: "/*",
    blockCommentEnd: "*/",
    lineComment: "//"
  };
});

CodeMirror.defineMIME("text/x-haxe", "haxe");

CodeMirror.defineMode("hxml", function () {

  return {
    startState: function () {
      return {
        define: false,
        inString: false
      };
    },
    token: function (stream, state) {
      var ch = stream.peek();
      var sol = stream.sol();

      ///* comments */
      if (ch == "#") {
        stream.skipToEnd();
        return "comment";
      }
      if (sol && ch == "-") {
        var style = "variable-2";

        stream.eat(/-/);

        if (stream.peek() == "-") {
          stream.eat(/-/);
          style = "keyword a";
        }

        if (stream.peek() == "D") {
          stream.eat(/[D]/);
          style = "keyword c";
          state.define = true;
        }

        stream.eatWhile(/[A-Z]/i);
        return style;
      }

      var ch = stream.peek();

      if (state.inString == false && ch == "'") {
        state.inString = true;
        ch = stream.next();
      }

      if (state.inString == true) {
        if (stream.skipTo("'")) {

        } else {
          stream.skipToEnd();
        }

        if (stream.peek() == "'") {
          stream.next();
          state.inString = false;
        }

        return "string";
      }

      stream.next();
      return null;
    },
    lineComment: "#"
  };
});

CodeMirror.defineMIME("text/x-hxml", "hxml");

});
