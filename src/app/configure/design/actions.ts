"use server";
import { db } from '@/db'
import { CaseColor, CaseFinish, CaseMaterial, PhoneModel } from '@prisma/client'

export type SaveConfigArgs = {
    color: CaseColor
    finish: CaseFinish
    material: CaseMaterial
    model: PhoneModel
    configId: string
}
export async function saveConfigurationToDB({ color, finish, material, model, configId }: SaveConfigArgs) {
    // save config to db
    await db.configuration.update({
        where: { id: configId },
        data: { color, finish, material, model },
    })
}