import { Chord, Note, Distance } from "tonal"

const translateType = (type) => {
  const notes = [0, 0, 0, null, null, null, null]
  let baseType = type
  let tension
  let omit

  const tensionRegex = /\((.*)\)/
  const tensionMatch = type.match(tensionRegex)
  if (tensionMatch) {
    tension = tensionMatch[1].replace(/\s+/g, "").split(",")
    baseType = baseType.replace(tensionRegex, "")
  }

  const omitRegex = /omit(\d+)/
  const omitMatch = type.match(omitRegex)
  if (omitMatch) {
    omit = omitMatch[1]
    baseType = baseType.replace(omitRegex, "")
  }

  const parseType = (regex) => {
    if (baseType.match(regex)) {
      baseType = baseType.replace(regex, "")
      return true
    } else {
      return false
    }
  }

  // base
  switch (true) {
    case parseType(/^M(?!(7|9|11|13))/): break
    case parseType(/^m(?!aj)/): notes[1] = -1; break
    case parseType(/aug/):      notes[2] = 1;  break
    case parseType(/Φ|φ/):      notes[1] = -1; notes[2] = -1; notes[3] = 0; break
  }
  // +-
  switch (true) {
    case parseType(/\+5|#5/): notes[2] = 1;  break
    case parseType(/-5|b5/):  notes[2] = -1; break
  }
  switch (true) {
    case parseType(/^6/):  notes[3] = -1; break
    case parseType(/^7/):  notes[3] = 0;  break
    case parseType(/^9/):  notes[3] = 0;  notes[4] = 0; break
    case parseType(/^11/): notes[3] = 0;  notes[4] = 0; notes[5] = 0; break
    case parseType(/^13/): notes[3] = 0;  notes[4] = 0; notes[5] = 0; notes[6] = 0; break
  }
  // sus
  switch (true) {
    case parseType(/sus4/): notes[1] = 1;  break
    case parseType(/sus2/): notes[1] = -2; break
  }
  // add
  switch (true) {
    case parseType(/add2/):  notes[4] = -12; break
    case parseType(/add9/):  notes[4] = 0;   break
    case parseType(/add4/):  notes[5] = -12; break
    case parseType(/add11/): notes[5] = 0;   break
    case parseType(/add6/):  notes[6] = -12; break
    case parseType(/add13/): notes[6] = 0;   break
  }
  // M
  switch (true) {
    case parseType(/(M|maj|△|Δ)7/):  notes[3] = 1; break
    case parseType(/(M|maj|△|Δ)9/):  notes[3] = 1; notes[4] = 0; break
    case parseType(/(M|maj|△|Δ)11/): notes[3] = 1; notes[4] = 0; notes[5] = 0; break
    case parseType(/(M|maj|△|Δ)13/): notes[3] = 1; notes[4] = 0; notes[5] = 0; notes[6] = 0; break
  }
  // dim
  switch (true) {
    case parseType(/^(dim|o)7/): notes[1] -= 1; notes[2] -= 1; notes[3] = -1; break
    case parseType(/^(dim|o)/):  notes[1] -= 1; notes[2] -= 1; break
  }
  // tension
  if (tension) baseType += tension.join("")
  if (parseType(/(#|\+)9/))  notes[4] = 1
  if (parseType(/(b|-)9/))   notes[4] = -1
  if (parseType(/9/))        notes[4] = 0
  if (parseType(/(#|\+)11/)) notes[5] = 1
  if (parseType(/(b|-)11/))  notes[5] = -1
  if (parseType(/11/))       notes[5] = 0
  if (parseType(/(#|\+)13/)) notes[6] = 1
  if (parseType(/(b|-)13/))  notes[6] = -1
  if (parseType(/13/))       notes[6] = 0
  // omit
  switch (omit) {
    case "1":  notes[0] = null; break
    case "3":  notes[1] = null; break
    case "5":  notes[2] = null; break
    case "7":  notes[3] = null; break
    case "9":  notes[4] = null; break
    case "11": notes[5] = null; break
    case "13": notes[6] = null; break
  }

  return notes
}

const transposer = (note, interval) => Note.fromMidi(Note.midi(note) + interval)

const buildChord = (root, baseNotes, translator) => {
  const notes = []
  const chord13 = Chord.notes(root, "13") // 13コードを基準にして音を足したり減らしたりする
  chord13.splice(5, 0, Distance.transpose(root, "M11")) // tonal の 13コードは 11th が omit されている

  for (let i = 0; i < 7; i += 1) {
    if (translator[i] !== null) notes.push(transposer(chord13[i], translator[i]))
  }
  return notes
}

const chordTranslator = (root, type = "", baseKey = 3) => {
  const baseNotes = Chord.notes(`${root}${baseKey}`, "M")
  const notes = buildChord(`${root}${baseKey}`, baseNotes, translateType(type))
  return notes
}

export default chordTranslator
