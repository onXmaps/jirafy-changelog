[ABC-123] Brackets around single ticket
[ABC-123, ABC-124] Brackets around list of tickets
[ABC-1] [ABC-2][ABC-3],[ABC-4], [ABC-5] Brackets around each individual ticket
ABC-123 No brackets
ABC-123, ABC-124 No brackets multiple
[ABC-123], [ABC-124] Brackets around individual tickets
[ABC-123], ABC-124 Some brackets, but not all
[ABC-123 Unmatched open bracket
ABC-123] Unmatched closing bracket
]ABC-1 Unmatched closing bracket at beginning - do we want to handle this?
ABC-1[ Unmatched opening bracket at end - do we want to handle this?
[[ABC-1]] Double brackets around ticket - do we want to handle this?
[]ABC-1[] Matched set of brackets before or after ticket - do we want to handle this?