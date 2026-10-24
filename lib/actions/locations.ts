"use server";

import { prisma } from "@/lib/prisma";

export async function getCountries() {
  return await prisma.country.findMany();
}

export async function getProvinces(countryId: string) {
  return await prisma.province.findMany({
    where: { countryId },
    orderBy: { name: 'asc' },
  });
}

export async function getCities(provinceId: string) {
  return await prisma.city.findMany({
    where: { provinceId },
    orderBy: { name: 'asc' },
  });
}

export async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
}