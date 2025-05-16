import React, { useEffect, useState } from "react";
import { FormControl, InputLabel, Select, MenuItem, Chip, Box, OutlinedInput, CircularProgress } from "@mui/material";
import labelService from "../services/label";

export default function LabelSelector({ value, onChange, disabled }) {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    labelService.getAll().then(setLabels).finally(() => setLoading(false));
  }, []);

  return (
    <FormControl fullWidth sx={{ mt: 2 }} disabled={disabled}>
      <InputLabel>Labels</InputLabel>
      <Select
        multiple
        value={value}
        onChange={e => onChange(e.target.value)}
        input={<OutlinedInput label="Labels" />}
        renderValue={selected => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map(id => {
              const label = labels.find(l => l.id === id);
              return label ? <Chip key={id} label={label.name} sx={{ bgcolor: label.color, color: '#fff' }} /> : null;
            })}
          </Box>
        )}
      >
        {loading ? <MenuItem disabled><CircularProgress size={20} /></MenuItem> :
          labels.map(label => (
            <MenuItem key={label.id} value={label.id}>
              <Chip label={label.name} size="small" sx={{ bgcolor: label.color, color: '#fff', mr: 1 }} />
              {label.name}
            </MenuItem>
          ))
        }
      </Select>
    </FormControl>
  );
}
