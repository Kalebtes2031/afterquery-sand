window.ClientFilters = {
  refineClientQueue(rows, filter) {
    if (!filter || filter === 'all') return rows;
    return rows.filter(row => row.status !== filter);
  }
};
