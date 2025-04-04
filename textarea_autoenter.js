function getInputSelection(el) {
	var start = 0, end = 0, normalizedValue, range,
	textInputRange, len, endRange;

	if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
		start = el.selectionStart;
		end = el.selectionEnd;
	} else {
		range = document.selection.createRange();

		if (range && range.parentElement() == el) {
			len = el.value.length;
            normalizedValue = el.value.replace(/\r\n/g, "\n");

			// Create a working TextRange that lives only in the input
			textInputRange = el.createTextRange();
			textInputRange.moveToBookmark(range.getBookmark());

			// Check if the start and end of the selection are at the very end
			// of the input, since moveStart/moveEnd doesn't return what we want
			// in those cases
			endRange = el.createTextRange();
			endRange.collapse(false);

			if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
				start = end = len;
			} else {
				start = -textInputRange.moveStart("character", -len);
				start += normalizedValue.slice(0, start).split("\n").length - 1;

				if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
					end = len;
				} else {
					end = -textInputRange.moveEnd("character", -len);
					end += normalizedValue.slice(0, end).split("\n").length - 1;
				}
			}
		}
	}

	return {
		start: start,
		end: end
	};
}

function offsetToRangeCharacterMove(el, offset) {
	return offset - (el.value.slice(0, offset).split("\r\n").length - 1);
}

function setInputSelection(el, startOffset, endOffset) {
	if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
		el.selectionStart = startOffset;
		el.selectionEnd = endOffset;
	} else {
		var range = el.createTextRange();
		var startCharMove = offsetToRangeCharacterMove(el, startOffset);
		range.collapse(true);
		if (startOffset == endOffset) {
			range.move("character", startCharMove);
		} else {
			range.moveEnd("character", offsetToRangeCharacterMove(el, endOffset));
			range.moveStart("character", startCharMove);
		}
		range.select();
	}
}

function getCaret(el) {
	if (el.selectionStart) {
		return el.selectionStart;
	} else if (document.selection) {
		el.focus();

		var r = document.selection.createRange();
		if (r == null) {
		return 0;
		}

		var re = el.createTextRange(),
		rc = re.duplicate();
		re.moveToBookmark(r.getBookmark());
		rc.setEndPoint('EndToStart', re);

		return rc.text.length;
	}
	return 0;
}

var textarea_autoenter_character_string = ""

function textarea_autoenter_eventlistener(event) {
    if (event.keyCode == 13) { // If enter is pressed.
        var content = this.value;
        var sel = getInputSelection(this);
        var caret = getCaret(this);
        var bullet = textarea_autoenter_character_string;
        console.log(bullet);
        var bulletLength = bullet.length;
        this.value = content.substring(0,caret) +
            bullet +
            content.substring(caret,content.length);
        setInputSelection(this, sel.start + bulletLength, sel.end + bulletLength);
        event.stopPropagation();
    }
};

function assign_textarea(el, character_string) {
    textarea_autoenter_character_string = character_string || "";
    el.addEventListener("keyup", textarea_autoenter_eventlistener);
}
