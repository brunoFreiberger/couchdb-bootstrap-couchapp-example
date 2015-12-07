/** 
 * Bruno Henrique Freiberger
 * Material de consulta: http://www.ibm.com/developerworks/opensource/tutorials/os-couchapp/#list6
 * http://127.0.0.1:5984/produtos/_design/produtos/_view/viewprodutos
 * couchapp push http://127.0.0.1:5984/produtos
 * couchapp generate view viewprodutos
 * reduce.js deletada da view
*/

//Nome da Tabela/Documento
db = $.couch.db("produtos");

//Function que salva os produtos na base
function salvar(edicao, form, doc){
	db.saveDoc(doc, {
		success: function() { 
			$("#messages").removeClass("alert-danger");
			$("#messages").addClass("alert-info").css("display", "block").text(!edicao ? "Produto cadastrado com sucesso!" : "Produto alterado com sucesso!").hide().fadeIn(500);
			if(edicao)
				consultar();
		},
	});
}

//Função que excluir os registros
function excluir(){
	var id = $('#id-registro-selecionado').val();
	if(id != null && id != ''){
		db.openDoc(id, {
			success: function(doc) {
				db.removeDoc(doc, { 
					success: function() {
						$("#messages").removeClass("alert-danger");
						$("#messages").addClass("alert-info").css("display", "block").text("Produto excluido com sucesso!").hide().fadeIn(500);
						consultar();
					}
				});
			}
		});	
	}
}

//Função de cadastrar
function cadastrar(event) {
	var form = $(event.target).parents('form#btn-add');
	if(createProduto() != null) {
		var doc = createProduto();
		salvar(false, form, doc);
	}
}

//Função de edição de registros
function editar(){
	var form = $(event.target).parents('form#btn-salvar-edicao');
	var id = $('#id-registro-selecionado').val();
	if(id != null && id != ''){
		db.openDoc(id, {
			success: function(doc) {
				var produto = createProdutoEdicao(doc);
				if(produto != null) {
					doc = produto;
					salvar(true, form, doc);
				}
			}
		});
	}

}

//Carrega os campos da tela de edição
function loadEditar(id){
	$('#id-registro-selecionado').val(id);
	db.openDoc(id, { success: function(doc) { 
		$('#inp_nome_dialog').val(doc.nome);
		$('#inp_valor_dialog').val(doc.valor);	
		$('#inp_fornecedor_dialog').val(doc.fornecedor);
		$('#inp_descricao_dialog').val(doc.descricao);
	}});
}

//Carrega a confirmação da exclusão
function loadExcluir(id){
	$('#id-registro-selecionado').val(id);
}

//Função de consulta
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

//Cria produtos apartir do formulário da tela de edição
function createProdutoEdicao(doc){
	var nome = $("#inp_nome_dialog").val();
	var valor = $("#inp_valor_dialog").val();
	var fornecedor = $("#inp_fornecedor_dialog").val();
	var descricao = $("#inp_descricao_dialog").val();
	return buildProduto(doc, nome, valor, fornecedor, descricao)
}

//Cria produto apartir dos campos da tela
function createProduto(){
	var nome = $("#inp_nome").val();
	var valor = $("#inp_valor").val();
	var fornecedor = $("#inp_fornecedor").val();
	var descricao = $("#inp_descricao").val();
	return buildProduto(null, nome, valor, fornecedor, descricao)
}

//Cria produto apartir do formulário
function buildProduto(doc, nome, valor, fornecedor, descricao){
	var produto = null;
	if(validaCampos(nome, valor, fornecedor, descricao)) {
		if(doc!= null) {
			doc.nome = nome;
			doc.valor = valor;
			doc.fornecedor = fornecedor;
			doc.descricao = descricao;
			produto = doc;
		} else {
			produto = new Produto(nome, valor, fornecedor, descricao);
		}
	} else {
		produto = null;
	}
	return produto;	
}

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

//Função que cria a linha da tabela de consulta
function createRow(produto, id){
	
	var columns = [];
	var row = $("<tr>");
	var col_nome = $('<td>').html(produto.nome);
	var col_valor = $('<td>').html(produto.valor);
	var col_fornecedor = $('<td>').html(produto.fornecedor);
	var col_descricao = $('<td> <button type="button" class="btn btn-primary btn-show-descricao" id="'+id+'" data-toggle="modal" data-target="#dialog-descricao">Visualizar</button></td>');
	var col_editar = $('<td> <button type="button" class="btn btn-success btn-editar" style="width: 100%" id="'+id+'" data-toggle="modal" data-target="#dialog-editar">Editar</button></td>');
	var col_excluir = $('<td> <button type="button" class="btn btn-danger btn-excluir" style="width: 100%" id="'+id+'" data-toggle="modal" data-target="#dialog-confirm-exclusao">Excluir</button></td>');
	
	columns.push(col_nome);
	columns.push(col_valor);
	columns.push(col_fornecedor);
	columns.push(col_descricao);
	columns.push(col_editar);
	columns.push(col_excluir);
		
	
	$.each(columns, function(index, value){
		row.append(value);
	})
	
	return row;
}

//'Triggers' dos botões

//Trigger para invocar a função de salvar
$("input#btn-add").live('click', function(event){
	cadastrar(event);
});

//Trigger para invocar a função de consultar
$("input#btn-consultar").live('click', function(event){
	consultar();
});

//Trigger para invocar a carregar os campos da edição
$("button.btn-editar").live('click', function(event){
	var id = event.target.id;
	loadEditar(id);
});

//Trigger para invocar a função para salvar edição
$("button#btn-salvar-edicao").live('click', function(event){
	var id = event.target.id;
	editar(id);
});

//Trigger para invocar a função de exclusao
$("button.btn-excluir").live('click', function(event){
	var id = event.target.id;
	loadExcluir(id);
});

//Trigger para invocar a função de exclusão
$("button#btn-confirma-exclusao").live('click', function(event){
	excluir();
});

//Trigger para invocar a função de carregar descrição
$("button.btn-show-descricao").live('click', function(event){
	var id = event.target.id;
	db.openDoc(id, { success: function(doc) { 
		$('.dialog-nome-produto').text('Produto: '+ doc.nome);
		$('#dialog-produto').html('Descrição: '+doc.descricao);	
	}});
});