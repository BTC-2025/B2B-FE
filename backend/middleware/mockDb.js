import mongoose from "mongoose";

const db = {}; // collectionName -> array of docs

const getCollection = (modelName) => {
  if (!db[modelName]) {
    db[modelName] = [];
  }
  return db[modelName];
};

const filterItems = (items, filter) => {
  if (!filter || Object.keys(filter).length === 0) return items;
  return items.filter(item => {
    for (const key in filter) {
      let filterVal = filter[key];
      let itemVal = item[key];

      if (filterVal === undefined) continue;

      // Handle simple operators like $or or $and if present
      if (key === "$or" && Array.isArray(filterVal)) {
        if (!filterVal.some(subFilter => filterItems([item], subFilter).length > 0)) {
          return false;
        }
        continue;
      }

      if (key === "$and" && Array.isArray(filterVal)) {
        if (!filterVal.every(subFilter => filterItems([item], subFilter).length > 0)) {
          return false;
        }
        continue;
      }

      // Handle RegExp instances or operator objects
      if (filterVal && typeof filterVal === 'object') {
        if (filterVal instanceof RegExp) {
          const strVal = String(itemVal || '');
          if (!filterVal.test(strVal)) return false;
          continue;
        }

        if (filterVal.$regex !== undefined) {
          const pattern = filterVal.$regex;
          const options = filterVal.$options || '';
          const regex = new RegExp(pattern, options);
          const strVal = String(itemVal || '');
          if (!regex.test(strVal)) return false;
          continue;
        }

        if (filterVal.$in !== undefined && Array.isArray(filterVal.$in)) {
          const matches = filterVal.$in.some(val => {
            if (val instanceof RegExp) {
              if (Array.isArray(itemVal)) {
                return itemVal.some(iv => val.test(String(iv)));
              }
              return val.test(String(itemVal || ''));
            }
            if (Array.isArray(itemVal)) {
              return itemVal.some(iv => String(iv) === String(val));
            }
            return String(itemVal) === String(val);
          });
          if (!matches) return false;
          continue;
        }

        // Convert Mongoose/ObjectId object to string
        if (filterVal.toString) {
          filterVal = filterVal.toString();
        }
      }

      if (itemVal && typeof itemVal === 'object' && itemVal.toString) {
        itemVal = itemVal.toString();
      }

      // Support matching inside arrays (like tags)
      if (Array.isArray(itemVal)) {
        if (!itemVal.some(subVal => String(subVal) === String(filterVal))) {
          return false;
        }
      } else {
        const itemValStr = itemVal !== null && itemVal !== undefined ? itemVal.toString() : '';
        const filterValStr = filterVal !== null && filterVal !== undefined ? filterVal.toString() : '';
        if (itemValStr !== filterValStr) {
          return false;
        }
      }
    }
    return true;
  });
};

class MockQuery {
  constructor(results) {
    this.results = results;
  }
  select() { return this; }
  populate(path) {
    const popItem = (item) => {
      if (!item) return;
      if (path === "supplier" && item.supplier) {
        const suppliers = db["Supplier"] || [];
        const supplierId = item.supplier.toString();
        const found = suppliers.find(s => s._id.toString() === supplierId || (s.user && s.user.toString() === supplierId));
        if (found) {
          item.supplier = found;
        }
      }
    };

    if (Array.isArray(this.results)) {
      this.results.forEach(popItem);
    } else if (this.results) {
      popItem(this.results);
    }
    return this;
  }
  sort() { return this; }
  limit(n) {
    if (Array.isArray(this.results)) {
      this.results = this.results.slice(0, n);
    }
    return this;
  }
  skip(n) {
    if (Array.isArray(this.results)) {
      this.results = this.results.slice(n);
    }
    return this;
  }
  then(onResolve, onReject) {
    return Promise.resolve(this.results).then(onResolve, onReject);
  }
  catch(onReject) {
    return Promise.resolve(this.results).catch(onReject);
  }
}

export function enableMockDb() {
  console.log("⚠️ Activating Zero-Dependency Mock In-Memory MongoDB Database Layer...");

  // Override model queries
  mongoose.Model.find = function(filter = {}) {
    const items = getCollection(this.modelName);
    const matched = filterItems(items, filter);
    // Convert to model instances so they have Mongoose helper methods
    const instances = matched.map(item => {
      const inst = new this(item);
      Object.assign(inst, item);
      return inst;
    });
    return new MockQuery(instances);
  };

  mongoose.Model.findOne = function(filter = {}) {
    const items = getCollection(this.modelName);
    const matched = filterItems(items, filter);
    if (matched[0]) {
      const inst = new this(matched[0]);
      Object.assign(inst, matched[0]);
      return new MockQuery(inst);
    }
    return new MockQuery(null);
  };

  mongoose.Model.findById = function(id) {
    const items = getCollection(this.modelName);
    const matched = items.find(item => item._id === id || (item._id && id && item._id.toString() === id.toString()));
    if (matched) {
      const inst = new this(matched);
      Object.assign(inst, matched);
      return new MockQuery(inst);
    }
    return new MockQuery(null);
  };

  mongoose.Model.countDocuments = async function(filter = {}) {
    const items = getCollection(this.modelName);
    return filterItems(items, filter).length;
  };

  mongoose.Model.create = async function(doc) {
    const items = getCollection(this.modelName);
    const docs = Array.isArray(doc) ? doc : [doc];
    const createdDocs = docs.map(d => {
      const newDoc = JSON.parse(JSON.stringify(d));
      if (!newDoc._id) {
        newDoc._id = new mongoose.Types.ObjectId().toString();
      }
      return newDoc;
    });

    items.push(...createdDocs);

    // Return instance or array of instances
    const instances = createdDocs.map(d => {
      const inst = new this(d);
      Object.assign(inst, d);
      return inst;
    });

    return Array.isArray(doc) ? instances : instances[0];
  };

  mongoose.Model.insertMany = async function(docs) {
    const items = getCollection(this.modelName);
    const createdDocs = docs.map(d => {
      const newDoc = JSON.parse(JSON.stringify(d));
      if (!newDoc._id) {
        newDoc._id = new mongoose.Types.ObjectId().toString();
      }
      items.push(newDoc);
      return newDoc;
    });
    return createdDocs;
  };

  mongoose.Model.findByIdAndUpdate = function(id, update, options) {
    const items = getCollection(this.modelName);
    const index = items.findIndex(item => item._id === id || (item._id && id && item._id.toString() === id.toString()));
    if (index === -1) return new MockQuery(null);

    const current = items[index];
    const updatePayload = update.$set || update;
    const updated = { ...current, ...updatePayload };
    items[index] = updated;

    const inst = new this(updated);
    Object.assign(inst, updated);
    return new MockQuery(inst);
  };

  mongoose.Model.findOneAndUpdate = function(filter, update, options) {
    const items = getCollection(this.modelName);
    const index = items.findIndex(item => filterItems([item], filter).length > 0);
    if (index === -1) return new MockQuery(null);

    const current = items[index];
    const updatePayload = update.$set || update;
    const updated = { ...current, ...updatePayload };
    items[index] = updated;

    const inst = new this(updated);
    Object.assign(inst, updated);
    return new MockQuery(inst);
  };

  mongoose.Model.findByIdAndDelete = function(id) {
    const items = getCollection(this.modelName);
    const index = items.findIndex(item => item._id === id || (item._id && id && item._id.toString() === id.toString()));
    if (index === -1) return new MockQuery(null);
    const deleted = items.splice(index, 1)[0];
    return new MockQuery(deleted);
  };

  mongoose.Model.prototype.save = async function() {
    const items = getCollection(this.constructor.modelName);
    const doc = this.toObject ? this.toObject() : this;
    if (!doc._id) {
      doc._id = new mongoose.Types.ObjectId().toString();
      this._id = doc._id;
    }
    const index = items.findIndex(item => item._id && doc._id && item._id.toString() === doc._id.toString());
    if (index !== -1) {
      // Merge properties correctly, preserving arrays like reviews
      items[index] = { ...items[index], ...doc };
    } else {
      items.push(doc);
    }
    return this;
  };
}
