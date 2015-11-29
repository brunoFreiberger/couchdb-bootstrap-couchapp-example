/** 
 * Bruno Henrique Freiberger
 * http://127.0.0.1:5984/produtos/_design/produtos/_view/viewprodutos
 * couchapp push http://127.0.0.1:5984/produtos
 * couchapp generate view viewprodutos
 * reduce.js deletada da view
*/

//Nome da Tabela/Documento
db = $.couch.db("produtos");

//Function que salva os produtos na base
function salvar(event){
	var form = $(event.target).parents('form#btn-add');
	//TODO remover
	console.log('Verificando id do formulário: ' + form.id);
	
	var nome = $("#inp_nome").val();
	var valor = $("#inp_valor").val();
	var fornecedor = $("#inp_fornecedor").val();
	var descricao = $("#inp_descricao").val();
	
	if(validaCampos(nome, valor, fornecedor, descricao)) {
		var produto = new Produto(nome, valor, fornecedor, descricao);
		var doc = produto;
		db.saveDoc(doc, {
			success: function() { 
				$("#messages").removeClass("alert-danger");
				$("#messages").addClass("alert-info").css("display", "block").text("Produto cadastrado com sucesso!").hide().fadeIn(500);
			},
		});
	} 
}

//Trigger para invocar a função de salvar
$("input#btn-add").live('click', function(event){
	salvar(event);
});

//Trigger para invocar a função de consultar
$("input#btn-consultar").live('click', function(event){
	consultar();
});

//Conversor de obj js em json
function converteProdutoJson(produto){
	//null, "\t" -> indenta para apresentar no console
	var produtoJSON = JSON.stringify(produto, null, "\t");
	console.log(produtoJSON);
	return produtoJSON;
}

//Validação Simples dos campos
function validaCampos(nome, valor, fornecedor, descricao){
	if(!nome || !valor || !fornecedor || !descricao) {
		$("#messages").removeClass("alert-info");
		$("#messages").addClass("alert-danger").css("display", "block").text("Preencha todos os campos!").hide().fadeIn(500);
		return false;
	}
	return true;
}

//Construtor de produto
function Produto(nome, valor, fornecedor, descricao){
	this.nome = nome;
	this.valor = valor;
	this.fornecedor = fornecedor;
	this.descricao = descricao;
}

function createRow(produto, id){
	
	var columns = [];
	var row = $("<tr>");
	var col_nome = $('<td>').html(produto.nome);
	var col_valor = $('<td>').html(produto.valor);
	var col_fornecedor = $('<td>').html(produto.fornecedor);
	var col_descricao = $('<td> <button type="button" class="btn btn-primary btn-show-descricao" id="'+id+'" data-toggle="modal" data-target=".fade">Visualizar</button></div>');
	
	columns.push(col_nome);
	columns.push(col_valor);
	columns.push(col_fornecedor);
	columns.push(col_descricao);	
	
	$.each(columns, function(index, value){
		row.append(value);
	})
	
	return row;
}

//Trigger para invocar a função de consultar
$("button.btn-show-descricao").live('click', function(event){
	var id = event.target.id;
	db.openDoc(id, { success: function(doc) { 
		$('.dialog-nome-produto').text('Produto: '+ doc.nome);
		$('#dialog-descricao-produto').html('Descrição: '+doc.descricao);	
	}});
});

function consultar(){
	
	var table = $('#table-results');
	table.empty();
	var produto = null;
	
	var header_col = '<thead>'
						+ '<tr> '
						+ 	'<th>Nome</th>'
						+	'<th>Valor</th>'
						+	'<th>Fornecedor</th>'
						+ 	'<th>Descrição</th>'
						+ '</tr>'
					+'</thead>';
	var body_col = $('<tbody>');				
	
	table.append(header_col);	
	
	db.view("produtos/viewprodutos", {
        success: function(data) {
            for (i in data.rows) {
				produto = new Produto(data.rows[i].value.nome, 
									  data.rows[i].value.valor, 
									  data.rows[i].value.fornecedor, 
									  data.rows[i].value.descricao);
				if(produto != null)
					body_col.append(createRow(produto, data.rows[i].value._id));
			}
	}});
	table.append(body_col);

}