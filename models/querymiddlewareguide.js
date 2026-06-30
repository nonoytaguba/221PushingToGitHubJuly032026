userSchema.pre('findOneAndUpdate', async function(next) {
  try {
    // 'this' refers to the current Query object
    const queryConditions = this.getQuery(); 
    
    // Explicitly query the database to find the target document
    const docToUpdate = await this.model.findOne(queryConditions);
    
    if (docToUpdate) {
      console.log('Accessing document before update:', docToUpdate);
      // You can now access or use properties from docToUpdate
    }
    
    next();
  } catch (error) {
    next(error);
  }
});
