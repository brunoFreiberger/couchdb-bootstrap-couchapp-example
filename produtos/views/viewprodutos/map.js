function(doc) {
	if (doc.nome) {
		emit(doc.nome,doc);
	}
}