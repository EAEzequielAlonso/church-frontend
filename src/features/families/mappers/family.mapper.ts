import { FamilyDto, FamilyMemberDto } from '../types/family.types';

export class FamilyMapper {
    static toDomain(dto: FamilyDto): FamilyDto {
        // Pass-through for now, but ready for transformations
        // e.g. Date formatting if we wanted Date objects instead of strings
        // or calculating derived fields.
        return {
            ...dto,
            members: dto.members.map(FamilyMapper.toMemberDomain)
        };
    }

    static toMemberDomain(dto: FamilyMemberDto): FamilyMemberDto {
        return {
            ...dto
        };
    }
}
