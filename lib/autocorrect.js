function textarea_autocorrect_eventlistener(event) {
    var content = this.value;
    var sel = getInputSelection(this);
    var caret = getCaret(this);
    //console.warn("caret: ", caret);
    var pre_caret = content.substring(0,caret);
    var words = pre_caret.split(/(\s)/gm);
    words = words.filter((str) => {return !(str == "" || str == " " || str=="\n")});
    var word = words[words.length-1];
    //console.warn("word: ", word);
    if (autoreplace_dictionary[word]) {
        //console.warn("content: ", content);
        pre_caret = pre_caret.substring(0, pre_caret.length - word.length - 1);
        //console.warn("pre_caret: ", pre_caret);
        var replacement = autoreplace_dictionary[word];
        pre_caret += replacement;
        //console.warn("substitution: ", pre_caret);
        this.value = pre_caret + content.substring(caret,content.length);
        content = this.value;
        setInputSelection(this, sel.start + replacement.length - word.length - 1, sel.end + replacement.length - word.length - 1);
    }
    event.stopPropagation();
};

function assign_autocorrect_element(el) {
    el.addEventListener("keyup", textarea_autocorrect_eventlistener);
}
