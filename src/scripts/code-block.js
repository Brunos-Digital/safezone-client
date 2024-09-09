$(document).ready(function () {
  if ($('#code-example').length > 0) {
    let doc = `// Imports
import mongoose, { Schema } from 'mongoose'

// Collection name
export const collection = 'Product'

// Schema
const schema = new Schema({
  name: {
    type: String,
    required: true
  },

  description: {
    type: String
  }
}, {timestamps: true})

// Model
`;

    let editor = CodeMirror.fromTextArea(document.getElementById('code-example'), {
      mode: "javascript",
      theme: 'default',
      lineNumbers: true,
      readOnly: true
    });

    function updateCodeMirror() {
      editor.setValue(doc);
    }


    $('#codeExample').on('shown.bs.modal', function () {
      updateCodeMirror();
    });
  }
});

