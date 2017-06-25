from application import db

##Will need to create models for the grfsm data structures once the API to communicate with the
##database has been finalized
class circuitArray(db.Model):
	__tablename__ = 'circuit_array'
	id = db.Column(db.Integer, primary_key=True)
	parts = db.Column(db.String(128), index=True, unique=False)
	grfsm_array_id = db.Column(db.Integer, db.ForeignKey('grfsm_array.id'))

	def __init__(self, parts, grfsm_array_id):
		self.parts = parts
		self.grfsm_array_id = grfsm_array_id

	def __repr__(self):
		return '<circuitArray %r>' % self.parts

class grfsmArray(db.Model):
	__tablename__ = 'grfsm_array'
	id = db.Column(db.Integer, primary_key=True)
	design_vector = db.Column(db.String(70), index=True, unique=True)

	def __init__(self, design_vector):
		self.design_vector = design_vector

	def __repr__(self):
		return '<grfsmArray %r>' % self.design_vector
