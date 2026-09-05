import { db, shippingAddresses, customerInquiries, eq, and, desc } from '@wellness/db';
import type { CreateAddressInput } from '@wellness/validation';

export interface CreateInquiryInput {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  inquiryType: string;
  message: string;
}

export class CustomerService {
  async getAddresses(userId: string) {
    const list = await db
      .select()
      .from(shippingAddresses)
      .where(eq(shippingAddresses.userId, userId))
      .orderBy(desc(shippingAddresses.createdAt));

    return list.map((addr) => {
      const parts = (addr.street || '').split(' | ');
      let fullName = '';
      let phone = '';
      let street = addr.street || '';

      if (parts.length >= 3) {
        fullName = parts[0] || '';
        phone = parts[1] || '';
        street = parts.slice(2).join(' | ');
      } else if (parts.length === 2) {
        fullName = parts[0] || '';
        street = parts[1] || '';
      }

      return {
        id: addr.id,
        fullName,
        phone,
        houseNumber: addr.houseNumber,
        street,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        country: addr.country || 'India',
        createdAt: addr.createdAt,
      };
    });
  }

  async addAddress(userId: string, input: CreateAddressInput) {
    const encodedStreet = `${input.fullName} | ${input.phone} | ${input.street}`;
    const [inserted] = await db
      .insert(shippingAddresses)
      .values({
        userId,
        houseNumber: input.houseNumber || null,
        street: encodedStreet,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        country: input.country || 'India',
      })
      .returning();

    return inserted;
  }

  async deleteAddress(userId: string, addressId: string) {
    const [deleted] = await db
      .delete(shippingAddresses)
      .where(and(eq(shippingAddresses.id, addressId), eq(shippingAddresses.userId, userId)))
      .returning();
    return deleted;
  }

  async createInquiry(input: CreateInquiryInput) {
    const [inserted] = await db
      .insert(customerInquiries)
      .values({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        company: input.company || null,
        inquiryType: input.inquiryType,
        message: input.message,
        status: 'pending',
      })
      .returning();
    return inserted;
  }

  async getInquiries() {
    const list = await db
      .select()
      .from(customerInquiries)
      .orderBy(desc(customerInquiries.createdAt));
    return list;
  }

  async updateInquiryStatus(id: string, status: string) {
    const [updated] = await db
      .update(customerInquiries)
      .set({ status, updatedAt: new Date() })
      .where(eq(customerInquiries.id, id))
      .returning();
    return updated;
  }
}

export const customerService = new CustomerService();
